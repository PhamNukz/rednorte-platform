import { useEffect, useState, useCallback } from 'react';
import { listaEsperaService, agendaService, reportesService } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ── SVG Icons (Lucide-style, 16×16 viewport) ───────────────────────────── */
const IconList = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconBarChart = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconCopy = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconChevronUp = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
const IconKey = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);
const IconCheckCircle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconXCircle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IconClipboardEmpty = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1"/>
    <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/>
  </svg>
);
const IconCalendarEmpty = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
);
const IconChartEmpty = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

/* ── Color maps ──────────────────────────────────────────────────────────── */
const PRIORIDAD_COLOR = {
  critica: '#dc2626', alta: '#d97706', media: '#2563eb', baja: '#64748b',
};
const PRIORIDAD_BG = {
  critica: '#fef2f2', alta: '#fffbeb', media: '#eff6ff', baja: '#f8fafc',
};
const ESTADO_COLOR = {
  pendiente: '#d97706', en_espera: '#2563eb', asignada: '#059669',
  cancelada: '#ef4444', completada: '#6b7280',
};
const ESTADO_BG = {
  pendiente: '#fffbeb', en_espera: '#eff6ff', asignada: '#f0fdf4',
  cancelada: '#fef2f2', completada: '#f8fafc',
};

/* Specialty accent colors for doctor initials */
const SPEC_COLORS = {
  'Cirugía General':  '#dc2626',
  'Medicina General': '#2563eb',
  'Traumatología':    '#059669',
  'Ginecología':      '#7c3aed',
  'Pediatría':        '#d97706',
  'Dermatología':     '#0891b2',
};

const TABS = [
  { key: 'lista',     label: 'Lista de Espera',   Icon: IconList },
  { key: 'horas',     label: 'Horas Disponibles',  Icon: IconCalendar },
  { key: 'dashboard', label: 'Dashboard',           Icon: IconBarChart },
  { key: 'medicos',   label: 'Médicos / Pruebas',   Icon: IconUsers },
];

export default function PanelAdmin() {
  const { user, logout } = useAuth();
  const [tab, setTab]           = useState('lista');
  const [tabKey, setTabKey]     = useState(0);
  const [solicitudes, setSolicitudes] = useState([]);
  const [dashboard, setDashboard]     = useState(null);
  const [horas, setHoras]             = useState([]);
  const [medicos, setMedicos]         = useState([]);
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
      const [solRes, dashRes, horasRes, medicosRes] = await Promise.all([
        listaEsperaService.listar(filtros),
        reportesService.dashboard().catch(() => ({ data: { data: null } })),
        agendaService.horasDisponibles({}).catch(() => ({ data: { data: [] } })),
        agendaService.medicos().catch(() => ({ data: { data: [] } })),
      ]);
      setSolicitudes(solRes.data.data || []);
      setDashboard(dashRes.data.data);
      setHoras(horasRes.data.data || []);
      setMedicos(medicosRes.data.data || []);
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
          <span style={s.headerDivider} />
          <span style={s.headerTitle}>Panel Administrativo</span>
        </div>
        <div style={s.hRight}>
          <div style={s.userChip}>
            <span style={s.rolBadge}>{user?.rol?.toUpperCase()}</span>
            <span style={s.rutText}>{user?.rut}</span>
          </div>
          <button onClick={logout} style={s.logoutBtn} className="btn-animate">
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <nav style={s.nav}>
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => changeTab(key)}
            style={s.tab}
            className={`nav-tab${tab === key ? ' active' : ''}`}
          >
            <span style={{ ...s.tabInner, color: tab === key ? '#0073b1' : '#64748b' }}>
              <span style={s.tabIconWrap}><Icon /></span>
              <span style={{ ...s.tabLabel, fontWeight: tab === key ? 600 : 400 }}>{label}</span>
            </span>
          </button>
        ))}
      </nav>

      {/* ── Filtros (solo lista) ── */}
      {tab === 'lista' && (
        <div style={s.filtrosBar} className="animate-fadeIn">
          <div style={s.selectWrap}>
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
          </div>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}><IconSearch /></span>
            <input
              style={s.filterInput}
              placeholder="Especialidad..."
              value={filtros.especialidad}
              onChange={e => setFiltros(f => ({ ...f, especialidad: e.target.value }))}
            />
          </div>
          <span style={s.total}>
            {solicitudes.length} resultado{solicitudes.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* ── Contenido ── */}
      <main style={s.main}>
        {loading ? <LoadingSkeleton /> : (
          <div key={tabKey} className="tab-content">
            {tab === 'lista' &&
              <TabLista solicitudes={solicitudes} cambiarEstado={cambiarEstado} />}
            {tab === 'horas' &&
              <TabHoras horas={horas} />}
            {tab === 'dashboard' && dashboard &&
              <TabDashboard dashboard={dashboard} />}
            {tab === 'dashboard' && !dashboard &&
              <EmptyState icon={<IconChartEmpty />} text="El dashboard requiere datos registrados en el sistema." />}
            {tab === 'medicos' &&
              <TabMedicos medicos={medicos} solicitudes={solicitudes} />}
          </div>
        )}
      </main>

      {/* ── Toast ── */}
      {toast && (
        <div
          key={toast.msg}
          style={{ ...s.toast, background: toast.type === 'error' ? '#dc2626' : '#059669' }}
          className="toast"
        >
          <span style={s.toastIcon}>
            {toast.type === 'error' ? <IconXCircle /> : <IconCheckCircle />}
          </span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ── Shared sub-components ──────────────────────────────────────────────── */

function EmptyState({ icon, text }) {
  return (
    <div style={s.emptyState} className="animate-fadeIn">
      <div style={s.emptyIcon}>{icon}</div>
      <p style={s.emptyText}>{text}</p>
    </div>
  );
}

function SectionHeader({ title, count, style: extra }) {
  return (
    <div style={{ ...s.sectionHeaderRow, ...extra }}>
      <h2 style={s.sectionTitle}>{title}</h2>
      {count !== undefined && <span style={s.countChip}>{count}</span>}
    </div>
  );
}

function ActionBtn({ color, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{ ...s.actionBtn, color, background: color + '12', border: `1px solid ${color}38` }}
      className="btn-animate"
    >
      {children}
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div style={s.skeletonWrap}>
      {[...Array(7)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, padding: '13px 18px', borderBottom: i < 6 ? '1px solid #f1f5f9' : 'none' }}>
          <div className="skeleton" style={{ width: 140, height: 13, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: 100, height: 13, borderRadius: 4, animationDelay: '0.05s' }} />
          <div className="skeleton" style={{ width: 80, height: 13, borderRadius: 4, animationDelay: '0.08s' }} />
          <div className="skeleton" style={{ width: 58, height: 21, borderRadius: 6, animationDelay: '0.12s' }} />
          <div className="skeleton" style={{ width: 68, height: 21, borderRadius: 6, animationDelay: '0.16s' }} />
          <div className="skeleton" style={{ flex: 1, height: 13, borderRadius: 4, animationDelay: '0.2s' }} />
        </div>
      ))}
    </div>
  );
}

/* ── Tab: Lista de Espera ────────────────────────────────────────────────── */

function TabLista({ solicitudes, cambiarEstado }) {
  if (solicitudes.length === 0) {
    return <EmptyState icon={<IconClipboardEmpty />} text="Sin solicitudes con los filtros aplicados." />;
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
              style={{ ...s.tr, background: i % 2 === 0 ? '#fff' : '#fafbfd' }}
              className={`table-row animate-fadeInUp delay-${Math.min(i + 1, 5)}`}
            >
              <td style={{ ...s.td, fontWeight: 600, color: '#111827' }}>{sol.nombre_paciente}</td>
              <td style={s.td}>{sol.especialidad}</td>
              <td style={{ ...s.td, color: '#6b7280' }}>{sol.tipo}</td>
              <td style={s.td}>
                <span style={{
                  ...s.badge,
                  color: PRIORIDAD_COLOR[sol.prioridad],
                  background: PRIORIDAD_BG[sol.prioridad],
                  border: `1px solid ${PRIORIDAD_COLOR[sol.prioridad]}28`,
                }}>
                  {sol.prioridad}
                </span>
              </td>
              <td style={s.td}>
                <span style={{
                  ...s.badge,
                  color: ESTADO_COLOR[sol.estado] || '#64748b',
                  background: ESTADO_BG[sol.estado] || '#f8fafc',
                  border: `1px solid ${(ESTADO_COLOR[sol.estado] || '#64748b')}28`,
                }}>
                  {sol.estado.replace('_', ' ')}
                </span>
              </td>
              <td style={{ ...s.td, color: '#9ca3af', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                {new Date(sol.fecha_ingreso).toLocaleDateString('es-CL')}
              </td>
              <td style={s.td}>
                <div style={s.actions}>
                  {sol.estado === 'pendiente' && (
                    <ActionBtn color="#2563eb" onClick={() => cambiarEstado(sol.id,'en_espera')}>
                      Activar
                    </ActionBtn>
                  )}
                  {!['cancelada','completada'].includes(sol.estado) && (
                    <ActionBtn color="#dc2626" onClick={() => cambiarEstado(sol.id,'cancelada')}>
                      Cancelar
                    </ActionBtn>
                  )}
                  {sol.estado === 'en_espera' && (
                    <ActionBtn color="#059669" onClick={() => cambiarEstado(sol.id,'asignada')}>
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

/* ── Tab: Horas Disponibles ──────────────────────────────────────────────── */

function TabHoras({ horas }) {
  if (horas.length === 0) {
    return (
      <>
        <SectionHeader title="Horas Médicas Disponibles" />
        <EmptyState icon={<IconCalendarEmpty />} text="Sin horas disponibles registradas." />
      </>
    );
  }
  return (
    <>
      <SectionHeader title="Horas Médicas Disponibles" count={horas.length} />
      <div style={s.horaList}>
        {horas.map((h, i) => (
          <div
            key={h.id}
            style={s.horaRow}
            className={`hora-card animate-fadeInUp delay-${Math.min(i + 1, 5)}`}
          >
            <span style={{ ...s.horaDot, background: h.estado === 'disponible' ? '#059669' : '#d97706' }} />
            <div style={s.horaInfo}>
              <span style={s.horaEsp}>{h.especialidad}</span>
              <span style={s.horaMed}>{h.nombre_medico}</span>
            </div>
            <div style={s.horaFechaCol}>
              {new Date(h.fecha_hora).toLocaleString('es-CL', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
            </div>
            <div style={s.horaHospCol}>{h.hospital}</div>
            <span style={{
              ...s.badge,
              color: h.estado === 'disponible' ? '#059669' : '#d97706',
              background: h.estado === 'disponible' ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${h.estado === 'disponible' ? '#059669' : '#d97706'}28`,
              fontSize: 10,
            }}>
              {h.estado}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Tab: Médicos / Pruebas ──────────────────────────────────────────────── */

const PASS_PRUEBA = 'Admin1234';

const CREDS_EXTRA = {
  '88888888-8': { rut: '88888888-8', nombre: 'Dr. Andrés Castillo',  especialidad: 'Cirugía General',  hospital: 'Hospital RedNorte Sur' },
  '44444444-4': { rut: '44444444-4', nombre: 'Dr. Carlos Muñoz',     especialidad: 'Medicina General', hospital: 'Hospital RedNorte Norte' },
  '66666666-6': { rut: '66666666-6', nombre: 'Dr. Roberto Pérez',    especialidad: 'Traumatología',    hospital: 'Clínica RedNorte Centro' },
  '55555555-5': { rut: '55555555-5', nombre: 'Dra. Carmen Vidal',    especialidad: 'Ginecología',      hospital: 'Hospital RedNorte Sur' },
  '77777777-7': { rut: '77777777-7', nombre: 'Dra. Sofía Morales',   especialidad: 'Pediatría',        hospital: 'Hospital RedNorte Norte' },
  '99999999-9': { rut: '99999999-9', nombre: 'Dra. Valeria Rojas',   especialidad: 'Dermatología',     hospital: 'Clínica RedNorte Centro' },
  '98765432-1': { rut: '98765432-1', nombre: 'Dr. Luis Méndez',      especialidad: 'Traumatología',    hospital: 'Hospital RedNorte Sur' },
};

function getInitials(nombre) {
  return nombre.replace(/Dr[a]?\.\s*/, '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function TabMedicos({ medicos, solicitudes }) {
  const [copied, setCopied]     = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [horasMap, setHorasMap] = useState({});
  const [loadingH, setLoadingH] = useState(true);

  useEffect(() => {
    const ruts = Object.keys(CREDS_EXTRA);
    Promise.all(
      ruts.map(rut =>
        agendaService.horasDisponibles({ medico_rut: rut, limit: 200 })
          .then(r => ({ rut, horas: r.data.data || [] }))
          .catch(() => ({ rut, horas: [] }))
      )
    ).then(results => {
      const map = {};
      results.forEach(({ rut, horas }) => { map[rut] = horas; });
      setHorasMap(map);
      setLoadingH(false);
    });
  }, []);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const lista = Object.values(CREDS_EXTRA).map(c => {
    const fromAgenda  = medicos.find(m => m.rut === c.rut);
    const horasDoc    = horasMap[c.rut] || [];
    const disponibles = horasDoc.filter(h => h.estado === 'disponible');
    const reservadas  = horasDoc.filter(h => h.estado === 'reservada');
    const citasSol    = solicitudes.filter(s =>
      reservadas.some(r => r.solicitud_id === s.id)
    );
    return { ...c, ...(fromAgenda || {}), disponibles, reservadas, citasSol };
  });

  return (
    <>
      <div style={sm.pageHead}>
        <div>
          <h2 style={s.sectionTitle}>Médicos del sistema</h2>
          <p style={sm.pageSubtitle}>Credenciales de prueba para Login Profesional</p>
        </div>
        <div style={sm.notice}>
          <IconKey />
          <span>Contraseña universal: <strong>Admin1234</strong></span>
          {loadingH && <span style={sm.loadingPill}>Cargando horas...</span>}
        </div>
      </div>

      {/* Admin credential card */}
      <div style={sm.adminCard} className="animate-fadeIn">
        <div style={sm.adminLeft}>
          <div style={{ ...sm.initBadge, background: '#1e3a5f', color: '#93c5fd' }}>AD</div>
          <div>
            <div style={sm.adminName}>Administrador del sistema</div>
            <div style={sm.adminRole}>Acceso completo</div>
          </div>
        </div>
        <div style={sm.adminCreds}>
          <div style={sm.credPair}>
            <span style={sm.credKey}>RUT</span>
            <code style={sm.credCode}>12345678-9</code>
            <button style={sm.copyBtn} onClick={() => copy('12345678-9', 'admin-rut')} title="Copiar RUT">
              {copied === 'admin-rut' ? <IconCheck /> : <IconCopy />}
            </button>
          </div>
          <div style={sm.credPair}>
            <span style={sm.credKey}>Contraseña</span>
            <code style={sm.credCode}>{PASS_PRUEBA}</code>
            <button style={sm.copyBtn} onClick={() => copy(PASS_PRUEBA, 'admin-pass')} title="Copiar contraseña">
              {copied === 'admin-pass' ? <IconCheck /> : <IconCopy />}
            </button>
          </div>
        </div>
      </div>

      {/* Doctor grid */}
      <div style={sm.grid}>
        {lista.map((med, i) => {
          const specColor = SPEC_COLORS[med.especialidad] || '#64748b';
          return (
            <div
              key={med.rut}
              style={sm.card}
              className={`animate-fadeInUp delay-${Math.min(i + 1, 5)}`}
            >
              <div style={{ ...sm.cardAccent, background: specColor }} />

              <div style={sm.cardHead}>
                <div style={{
                  ...sm.initBadge,
                  background: specColor + '16',
                  color: specColor,
                  border: `1px solid ${specColor}30`,
                }}>
                  {getInitials(med.nombre)}
                </div>
                <div style={sm.cardNameBlock}>
                  <div style={sm.nombre}>{med.nombre}</div>
                  <div style={{ ...sm.esp, color: specColor }}>{med.especialidad}</div>
                  <div style={sm.hosp}>{med.hospital}</div>
                </div>
              </div>

              <div style={sm.credBox}>
                <div style={sm.credRow}>
                  <span style={sm.credLabel}>RUT (usuario)</span>
                  <div style={sm.credVal}>
                    <code style={sm.codeInline}>{med.rut}</code>
                    <button style={sm.copyBtnSm} onClick={() => copy(med.rut, med.rut + '-rut')} title="Copiar">
                      {copied === med.rut + '-rut' ? <IconCheck /> : <IconCopy />}
                    </button>
                  </div>
                </div>
                <div style={sm.credRow}>
                  <span style={sm.credLabel}>Contraseña</span>
                  <div style={sm.credVal}>
                    <code style={sm.codeInline}>{PASS_PRUEBA}</code>
                    <button style={sm.copyBtnSm} onClick={() => copy(PASS_PRUEBA, med.rut + '-pass')} title="Copiar">
                      {copied === med.rut + '-pass' ? <IconCheck /> : <IconCopy />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={sm.statsRow}>
                <div style={sm.stat}>
                  <span style={{ ...sm.statNum, color: '#059669' }}>{med.disponibles?.length ?? '—'}</span>
                  <span style={sm.statLbl}>Disponibles</span>
                </div>
                <div style={sm.statDivider} />
                <div style={sm.stat}>
                  <span style={{ ...sm.statNum, color: '#d97706' }}>{med.reservadas?.length ?? '—'}</span>
                  <span style={sm.statLbl}>Reservadas</span>
                </div>
                <div style={sm.statDivider} />
                <div style={sm.stat}>
                  <span style={{ ...sm.statNum, color: '#2563eb' }}>{med.citasSol?.length ?? '—'}</span>
                  <span style={sm.statLbl}>Citas</span>
                </div>
              </div>

              {med.reservadas?.length > 0 && (
                <button
                  style={sm.expandBtn}
                  onClick={() => setExpanded(expanded === med.rut ? null : med.rut)}
                >
                  {expanded === med.rut
                    ? <><IconChevronUp /><span>Ocultar citas</span></>
                    : <><IconChevronDown /><span>{med.reservadas.length} cita{med.reservadas.length !== 1 ? 's' : ''} reservada{med.reservadas.length !== 1 ? 's' : ''}</span></>
                  }
                </button>
              )}
              {expanded === med.rut && (
                <div style={sm.citasList}>
                  {med.reservadas.map(h => (
                    <div key={h.id} style={sm.citaRow}>
                      <span style={sm.citaDot} />
                      <span style={sm.citaFecha}>
                        {new Date(h.fecha_hora).toLocaleString('es-CL', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </span>
                      {h.paciente_rut && <span style={sm.citaPac}>{h.paciente_rut}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── Tab: Dashboard ──────────────────────────────────────────────────────── */

function TabDashboard({ dashboard }) {
  const metrics = [
    {
      label: 'Cancelaciones',
      sub: 'últimos 30 días',
      value: dashboard.cancelaciones_30d?.canceladas ?? '—',
      color: '#dc2626',
      bg: '#fef2f2',
      borderColor: '#fecaca',
    },
    {
      label: 'Total solicitudes',
      sub: 'últimos 30 días',
      value: dashboard.cancelaciones_30d?.total ?? '—',
      color: '#2563eb',
      bg: '#eff6ff',
      borderColor: '#bfdbfe',
    },
    {
      label: 'Tasa de cancelación',
      sub: 'período actual',
      value: `${dashboard.cancelaciones_30d?.tasa_cancelacion_pct ?? 0}%`,
      color: '#d97706',
      bg: '#fffbeb',
      borderColor: '#fde68a',
    },
  ];

  return (
    <>
      <SectionHeader title="Resumen ejecutivo" />
      <div style={s.statsGrid}>
        {metrics.map((m, i) => (
          <div
            key={m.label}
            style={{ ...s.statCard, background: m.bg, borderColor: m.borderColor }}
            className={`stat-card animate-scaleIn delay-${i + 1}`}
          >
            <div style={{ ...s.statMeta, color: m.color }}>{m.label}</div>
            <div style={{ ...s.statVal, color: m.color }}>{m.value}</div>
            <div style={s.statSub}>{m.sub}</div>
          </div>
        ))}
      </div>

      <SectionHeader title="Solicitudes por estado" style={{ marginTop: 32 }} />
      <div style={s.tableWrapper} className="animate-fadeInUp delay-4">
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Estado</th>
              <th style={s.th}>Total</th>
              <th style={s.th}>Promedio en espera (h)</th>
            </tr>
          </thead>
          <tbody>
            {(dashboard.solicitudes_por_estado || []).map((row, i) => (
              <tr
                key={row.estado}
                style={{ ...s.tr, background: i % 2 === 0 ? '#fff' : '#fafbfd' }}
                className={`table-row animate-fadeInUp delay-${i + 1}`}
              >
                <td style={s.td}>
                  <span style={{
                    ...s.badge,
                    color: ESTADO_COLOR[row.estado] || '#64748b',
                    background: ESTADO_BG[row.estado] || '#f8fafc',
                    border: `1px solid ${(ESTADO_COLOR[row.estado] || '#64748b')}28`,
                  }}>
                    {row.estado}
                  </span>
                </td>
                <td style={{ ...s.td, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{row.total}</td>
                <td style={{ ...s.td, color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>{row.promedio_horas_espera ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */
const s = {
  layout:         { minHeight: '100vh', background: '#edf1f7', display: 'flex', flexDirection: 'column' },
  header:         { background: '#0c1b38', color: '#f1f5f9', padding: '0 32px', height: 58,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.05)' },
  hLeft:          { display: 'flex', alignItems: 'center', gap: 14 },
  brand:          { fontSize: 17, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' },
  headerDivider:  { width: 1, height: 18, background: 'rgba(241,245,249,0.16)' },
  headerTitle:    { fontSize: 12.5, color: 'rgba(241,245,249,0.45)', letterSpacing: '0.02px' },
  hRight:         { display: 'flex', alignItems: 'center', gap: 12 },
  userChip:       { display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.07)', borderRadius: 8,
                    padding: '5px 12px', border: '1px solid rgba(255,255,255,0.1)' },
  rolBadge:       { fontSize: 10, fontWeight: 700, color: '#93c5fd',
                    letterSpacing: '0.7px', textTransform: 'uppercase' },
  rutText:        { fontSize: 12, color: 'rgba(241,245,249,0.5)',
                    fontFamily: "'SF Mono','Cascadia Code','Fira Code',monospace" },
  logoutBtn:      { background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                    color: 'rgba(241,245,249,0.6)', padding: '5px 14px', borderRadius: 7,
                    cursor: 'pointer', fontSize: 12.5, fontWeight: 500 },
  nav:            { background: '#ffffff', borderBottom: '1px solid #e0e6ef', padding: '0 28px',
                    display: 'flex', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  tab:            { padding: '13px 18px', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' },
  tabInner:       { display: 'flex', alignItems: 'center', gap: 7, transition: 'color 0.16s' },
  tabIconWrap:    { display: 'flex', alignItems: 'center' },
  tabLabel:       { fontSize: 13.5, letterSpacing: '-0.1px' },
  filtrosBar:     { background: '#ffffff', padding: '9px 28px', borderBottom: '1px solid #e0e6ef',
                    display: 'flex', gap: 10, alignItems: 'center' },
  selectWrap:     { position: 'relative' },
  select:         { padding: '7px 12px', border: '1px solid #dce3ed', borderRadius: 8, fontSize: 13,
                    background: '#f6f8fb', outline: 'none', cursor: 'pointer', color: '#374151',
                    appearance: 'none', minWidth: 180 },
  searchWrap:     { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon:     { position: 'absolute', left: 10, color: '#9ca3af', display: 'flex', pointerEvents: 'none' },
  filterInput:    { padding: '7px 12px 7px 32px', border: '1px solid #dce3ed', borderRadius: 8,
                    fontSize: 13, background: '#f6f8fb', outline: 'none', width: 210, color: '#374151' },
  total:          { fontSize: 12, color: '#94a3b8', marginLeft: 'auto',
                    background: '#f1f5f9', padding: '3px 10px', borderRadius: 6,
                    fontVariantNumeric: 'tabular-nums' },
  main:           { flex: 1, padding: '24px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' },
  sectionHeaderRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle:   { fontSize: 17, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px', margin: 0 },
  countChip:      { background: '#f1f5f9', color: '#64748b', fontSize: 11, fontWeight: 600,
                    padding: '2px 9px', borderRadius: 20, border: '1px solid #e2e8f0' },
  tableWrapper:   { background: '#fff', borderRadius: 14, overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.055)', border: '1px solid #e0e6ef' },
  skeletonWrap:   { background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0e6ef' },
  table:          { width: '100%', borderCollapse: 'collapse' },
  thead:          { background: '#f6f8fb', borderBottom: '1px solid #e0e6ef' },
  th:             { padding: '10px 16px', color: '#6b7280', fontSize: 11, fontWeight: 600,
                    textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr:             { borderBottom: '1px solid #f1f5f9' },
  td:             { padding: '11px 16px', fontSize: 13, color: '#374151', verticalAlign: 'middle' },
  badge:          { display: 'inline-block', padding: '3px 8px', borderRadius: 6, fontSize: 11,
                    fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap', letterSpacing: '0.3px' },
  actions:        { display: 'flex', gap: 5, flexWrap: 'wrap' },
  actionBtn:      { border: 'none', padding: '4px 11px', borderRadius: 6, cursor: 'pointer',
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.1px', fontFamily: 'inherit' },
  horaList:       { display: 'flex', flexDirection: 'column',
                    background: '#fff', borderRadius: 14, overflow: 'hidden',
                    border: '1px solid #e0e6ef', boxShadow: '0 2px 10px rgba(0,0,0,0.055)' },
  horaRow:        { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px',
                    borderBottom: '1px solid #f1f5f9' },
  horaDot:        { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  horaInfo:       { flex: '0 0 250px', display: 'flex', flexDirection: 'column', gap: 2 },
  horaEsp:        { fontSize: 13, fontWeight: 600, color: '#111827' },
  horaMed:        { fontSize: 12, color: '#6b7280' },
  horaFechaCol:   { flex: '0 0 140px', fontSize: 13, color: '#374151',
                    fontVariantNumeric: 'tabular-nums', fontWeight: 500 },
  horaHospCol:    { flex: 1, fontSize: 12, color: '#9ca3af' },
  statsGrid:      { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 8 },
  statCard:       { border: '1px solid', borderRadius: 14, padding: '20px 22px 16px' },
  statMeta:       { fontSize: 13, fontWeight: 600, marginBottom: 8, letterSpacing: '-0.1px' },
  statVal:        { fontSize: 34, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums' },
  statSub:        { fontSize: 11, color: '#9ca3af', marginTop: 6, fontWeight: 500 },
  emptyState:     { textAlign: 'center', padding: '64px 0' },
  emptyIcon:      { color: '#cbd5e1', display: 'flex', justifyContent: 'center', marginBottom: 12 },
  emptyText:      { fontSize: 14, color: '#94a3b8' },
  toast:          { position: 'fixed', bottom: 24, right: 24, color: '#fff', padding: '10px 16px',
                    borderRadius: 10, fontWeight: 600, fontSize: 13, zIndex: 9999,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    display: 'flex', alignItems: 'center', gap: 8 },
  toastIcon:      { display: 'flex', alignItems: 'center' },
};

const sm = {
  pageHead:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  pageSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  notice:       { display: 'flex', alignItems: 'center', gap: 8,
                  background: '#f6f8fb', border: '1px solid #e0e6ef',
                  borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#374151' },
  loadingPill:  { background: '#e8edf5', color: '#64748b', padding: '2px 8px',
                  borderRadius: 10, fontSize: 11, marginLeft: 4 },
  adminCard:    { background: '#0c1b38', borderRadius: 14, padding: '18px 22px',
                  marginBottom: 22, display: 'flex', alignItems: 'center', gap: 32,
                  flexWrap: 'wrap', border: '1px solid rgba(255,255,255,0.07)' },
  adminLeft:    { display: 'flex', alignItems: 'center', gap: 14 },
  adminName:    { fontSize: 15, fontWeight: 700, color: '#f1f5f9' },
  adminRole:    { fontSize: 12, color: 'rgba(241,245,249,0.38)', marginTop: 2 },
  adminCreds:   { display: 'flex', gap: 24, flexWrap: 'wrap' },
  credPair:     { display: 'flex', alignItems: 'center', gap: 8 },
  credKey:      { fontSize: 10, color: 'rgba(241,245,249,0.38)', textTransform: 'uppercase',
                  letterSpacing: '0.6px', fontWeight: 600 },
  credCode:     { background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 6,
                  fontSize: 13, fontFamily: "'SF Mono','Cascadia Code','Fira Code',monospace",
                  color: '#93c5fd' },
  copyBtn:      { background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.13)',
                  color: '#cbd5e1', borderRadius: 6, padding: '5px 9px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center' },
  initBadge:    { width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px',
                  flexShrink: 0 },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 16 },
  card:         { background: '#fff', borderRadius: 14, border: '1px solid #e0e6ef',
                  overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cardAccent:   { height: 3, width: '100%', flexShrink: 0 },
  cardHead:     { display: 'flex', gap: 12, alignItems: 'flex-start', padding: '16px 18px 14px' },
  cardNameBlock:{ flex: 1 },
  nombre:       { fontWeight: 700, fontSize: 14, color: '#111827', letterSpacing: '-0.2px' },
  esp:          { fontSize: 12, fontWeight: 600, marginTop: 2 },
  hosp:         { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  credBox:      { background: '#f6f8fb', padding: '12px 18px',
                  borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9',
                  display: 'flex', flexDirection: 'column', gap: 8 },
  credRow:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  credLabel:    { fontSize: 10.5, color: '#64748b', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.4px' },
  credVal:      { display: 'flex', alignItems: 'center', gap: 6 },
  codeInline:   { background: '#e6eaf2', padding: '3px 8px', borderRadius: 5,
                  fontSize: 12, fontFamily: "'SF Mono','Cascadia Code','Fira Code',monospace",
                  color: '#1e3a5f' },
  copyBtnSm:    { background: 'none', border: '1px solid #e0e6ef', color: '#64748b',
                  borderRadius: 5, padding: '4px 7px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center' },
  statsRow:     { display: 'flex', alignItems: 'center', padding: '14px 18px' },
  statDivider:  { width: 1, height: 28, background: '#f1f5f9', margin: '0 12px', flexShrink: 0 },
  stat:         { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statNum:      { fontSize: 22, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  statLbl:      { fontSize: 9.5, color: '#94a3b8', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.3px' },
  expandBtn:    { margin: '0 18px 14px', background: 'none', border: '1px solid #e0e6ef',
                  borderRadius: 8, color: '#64748b', fontSize: 12, cursor: 'pointer',
                  padding: '7px 12px', fontWeight: 500, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 5, fontFamily: 'inherit' },
  citasList:    { display: 'flex', flexDirection: 'column', borderTop: '1px solid #f1f5f9' },
  citaRow:      { display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
                  padding: '8px 18px', borderBottom: '1px solid #fafbfd' },
  citaDot:      { width: 6, height: 6, borderRadius: '50%', background: '#d97706', flexShrink: 0 },
  citaFecha:    { color: '#374151', fontWeight: 600, flex: 1, fontVariantNumeric: 'tabular-nums' },
  citaPac:      { color: '#94a3b8', fontSize: 11,
                  fontFamily: "'SF Mono','Cascadia Code','Fira Code',monospace" },
};
