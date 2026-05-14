import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { agendaService, listaEsperaService, authService } from '../services/api';

/* ── Datos estáticos ─────────────────────────────────────────────────────── */
const ESPECIALIDADES = [
  { id: 'Medicina General',  icon: '🩺' },
  { id: 'Cardiología',       icon: '❤️' },
  { id: 'Neurología',        icon: '🧠' },
  { id: 'Traumatología',     icon: '🦴' },
  { id: 'Ginecología',       icon: '🌸' },
  { id: 'Pediatría',         icon: '👶' },
  { id: 'Cirugía General',   icon: '🏥' },
  { id: 'Dermatología',      icon: '🔬' },
  { id: 'Psiquiatría',       icon: '🧩' },
  { id: 'Oftalmología',      icon: '👁️' },
  { id: 'Otorrinolaringología', icon: '👂' },
  { id: 'Urología',          icon: '💊' },
];

const TIPOS = [
  { id: 'PROGRAMADA',    label: 'Consulta / Control',    icon: '📋', desc: 'Control médico o consulta de rutina' },
  { id: 'URGENCIA',      label: 'Urgencia',              icon: '🚨', desc: 'Atención urgente requerida' },
  { id: 'PROCEDIMIENTO', label: 'Procedimiento / Examen',icon: '🔬', desc: 'Examen o procedimiento diagnóstico' },
  { id: 'QUIRURGICA',    label: 'Cirugía',               icon: '🏥', desc: 'Intervención quirúrgica programada' },
];

/* ── Componente principal ─────────────────────────────────────────────────── */
export default function ReservaWizard() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [step, setStep]                   = useState(1);
  const [rut, setRut]                     = useState('');
  const [especialidad, setEspecialidad]   = useState(params.get('especialidad') || '');
  const [tipo, setTipo]                   = useState('');
  const [horas, setHoras]                 = useState([]);
  const [loadingHoras, setLoadingHoras]   = useState(false);
  const [selectedDate, setSelectedDate]   = useState(null);
  const [selectedSlot, setSelectedSlot]   = useState(null);
  const [showModal, setShowModal]         = useState(false);

  // Si viene especialidad por URL, la pre-cargamos pero SIEMPRE arrancamos en paso 1 (RUT)
  // El paso 1 detectará que la especialidad ya está y saltará directo al paso 3
  const especialidadPreseleccionada = !!params.get('especialidad');

  const fetchHoras = useCallback(async () => {
    if (!especialidad) return;
    setLoadingHoras(true);
    try {
      const res = await agendaService.horasDisponibles({ especialidad, limit: 60 });
      const data = res.data.data || res.data || [];
      setHoras(data);
      // Pre-seleccionar primer día disponible
      if (data.length > 0) {
        const firstDate = new Date(data[0].fecha_hora).toDateString();
        setSelectedDate(firstDate);
      }
    } catch {
      setHoras([]);
    } finally {
      setLoadingHoras(false);
    }
  }, [especialidad]);

  useEffect(() => {
    if (step === 4) fetchHoras();
  }, [step, fetchHoras]);

  // Agrupar horas por fecha
  const horasPorFecha = horas.reduce((acc, h) => {
    const d = new Date(h.fecha_hora).toDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(h);
    return acc;
  }, {});
  const fechas = Object.keys(horasPorFecha).sort((a, b) => new Date(a) - new Date(b));

  const STEPS = [
    'Identificación',
    'Especialidad',
    'Tipo de atención',
    'Seleccionar hora',
  ];

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <header style={s.header}>
        <button onClick={() => navigate('/')} style={s.backBtn}>← Volver al inicio</button>

        <nav style={s.headerNav}>
          {[
            { icon: '📅', label: 'Reservar hora',  action: () => navigate('/reservar') },
            { icon: '🔍', label: 'Consultar hora', action: () => navigate('/mis-horas?tab=consultar') },
            { icon: '❌', label: 'Anular hora',     action: () => navigate('/mis-horas?tab=anular') },
            { icon: '🔄', label: 'Cambiar hora',    action: () => navigate('/mis-horas?tab=cambiar') },
          ].map(({ icon, label, action }) => (
            <button key={label} onClick={action} style={s.headerNavBtn} className="btn-animate">
              <span style={s.headerNavIcon}>{icon}</span>
              <span style={s.headerNavLabel}>{label}</span>
            </button>
          ))}
        </nav>

        <div style={s.headerBrandWrap}>
          <span style={s.headerBrand}>RedNorte</span>
          <span style={s.headerSep}>·</span>
          <span style={s.headerSub}>Reserva de Hora</span>
        </div>
      </header>

      {/* ── Progress ── */}
      <div style={s.progressWrap}>
        <StepProgress step={step} steps={STEPS} />
      </div>

      {/* ── Contenido ── */}
      <main style={s.main}>
        <div style={s.panel} className="tab-content" key={step}>

          {/* ── PASO 1: RUT ── */}
          {step === 1 && (
            <StepRut
              rut={rut}
              setRut={setRut}
              especialidadPreseleccionada={especialidadPreseleccionada ? especialidad : null}
              onNext={() => especialidadPreseleccionada ? setStep(3) : setStep(2)}
              onCancel={() => navigate('/')}
            />
          )}

          {/* ── PASO 2: Especialidad ── */}
          {step === 2 && (
            <StepEspecialidad
              selected={especialidad}
              onSelect={e => { setEspecialidad(e); setStep(3); }}
              onBack={() => setStep(1)}
            />
          )}

          {/* ── PASO 3: Tipo ── */}
          {step === 3 && (
            <StepTipo
              especialidad={especialidad}
              selected={tipo}
              onSelect={t => { setTipo(t); setStep(4); }}
              onBack={() => setStep(2)}
            />
          )}

          {/* ── PASO 4: Doctor / Hora ── */}
          {step === 4 && (
            <StepHora
              especialidad={especialidad}
              tipo={tipo}
              fechas={fechas}
              horasPorFecha={horasPorFecha}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              loading={loadingHoras}
              onConfirmar={() => setShowModal(true)}
              onBack={() => setStep(3)}
            />
          )}
        </div>
      </main>

      {/* ── Modal de confirmación (login) ── */}
      {showModal && (
        <ConfirmModal
          rut={rut}
          tipo={tipo}
          especialidad={especialidad}
          slot={selectedSlot}
          onClose={() => setShowModal(false)}
          onSuccess={() => navigate('/mis-horas')}
        />
      )}
    </div>
  );
}

/* ── Paso 1: Identificación ──────────────────────────────────────────────── */
function StepRut({ rut, setRut, especialidadPreseleccionada, onNext, onCancel }) {
  const [err, setErr] = useState('');
  const handleNext = () => {
    if (!rut.trim()) { setErr('Ingresa tu RUT para continuar.'); return; }
    if (rut.length < 7) { setErr('RUT no válido. Ej: 12.345.678-9'); return; }
    onNext();
  };
  return (
    <div style={s.stepContent}>
      <div style={s.stepIcon}>🪪</div>
      <h2 style={s.stepTitle}>¿Para quién es la hora?</h2>
      <p style={s.stepDesc}>Ingresa el RUT del paciente que será atendido</p>

      {/* Chip de especialidad pre-seleccionada */}
      {especialidadPreseleccionada && (
        <div style={s.preselChip} className="animate-scaleIn">
          <span style={s.preselDot}>✓</span>
          Especialidad seleccionada: <strong>{especialidadPreseleccionada}</strong>
        </div>
      )}

      <div style={s.formGroup}>
        <label style={s.label}>RUT del Paciente</label>
        <input
          className="input-field"
          style={{ ...s.input, ...(err ? s.inputErr : {}) }}
          type="text"
          placeholder="Ej: 12.345.678-9"
          value={rut}
          onChange={e => { setRut(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && handleNext()}
          autoFocus
        />
        {err && <p style={s.errText}>{err}</p>}
      </div>
      <div style={s.stepFooter}>
        <button onClick={onCancel} style={s.btnBack}>Cancelar</button>
        <button onClick={handleNext} style={s.btnNext} className="btn-animate">Continuar →</button>
      </div>
    </div>
  );
}

/* ── Paso 2: Especialidad ────────────────────────────────────────────────── */
function StepEspecialidad({ selected, onSelect, onBack }) {
  return (
    <div style={s.stepContent}>
      <h2 style={s.stepTitle}>¿Qué especialidad necesitas?</h2>
      <p style={s.stepDesc}>Selecciona el tipo de atención médica que requieres</p>
      <div style={s.espGrid}>
        {ESPECIALIDADES.map(({ id, icon }, i) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            style={{ ...s.espCard, ...(selected === id ? s.espCardActive : {}) }}
            className={`service-card animate-fadeInUp delay-${Math.min(i % 5 + 1, 5)}`}
          >
            <span style={s.espIcon}>{icon}</span>
            <span style={s.espName}>{id}</span>
          </button>
        ))}
      </div>
      <div style={s.stepFooter}>
        <button onClick={onBack} style={s.btnBack}>← Volver</button>
      </div>
    </div>
  );
}

/* ── Paso 3: Tipo de atención ────────────────────────────────────────────── */
function StepTipo({ especialidad, selected, onSelect, onBack }) {
  return (
    <div style={s.stepContent}>
      <h2 style={s.stepTitle}>{especialidad}</h2>
      <p style={s.stepDesc}>¿Qué tipo de atención necesitas?</p>
      <div style={s.tipoGrid}>
        {TIPOS.map(({ id, label, icon, desc }, i) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            style={{ ...s.tipoCard, ...(selected === id ? s.tipoActive : {}) }}
            className={`service-card animate-fadeInUp delay-${i + 1}`}
          >
            <span style={s.tipoIcon}>{icon}</span>
            <span style={s.tipoLabel}>{label}</span>
            <span style={s.tipoDesc}>{desc}</span>
          </button>
        ))}
      </div>
      <div style={s.stepFooter}>
        <button onClick={onBack} style={s.btnBack}>← Volver</button>
      </div>
    </div>
  );
}

/* ── Paso 4: Selección de doctor y hora ─────────────────────────────────── */
function StepHora({ especialidad, tipo, fechas, horasPorFecha, selectedDate, setSelectedDate,
                    selectedSlot, setSelectedSlot, loading, onConfirmar, onBack }) {
  const horasDelDia = selectedDate ? horasPorFecha[selectedDate] || [] : [];

  // Agrupar horas del día por médico
  const porMedico = horasDelDia.reduce((acc, h) => {
    const k = h.nombre_medico || 'Sin nombre';
    if (!acc[k]) acc[k] = [];
    acc[k].push(h);
    return acc;
  }, {});

  return (
    <div style={{ ...s.stepContent, maxWidth: 760 }}>
      <h2 style={s.stepTitle}>Selecciona día y hora</h2>
      <p style={s.stepDesc}>
        <strong>{especialidad}</strong> · {TIPOS.find(t => t.id === tipo)?.label}
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={s.spinner} />
          <p style={{ color: '#9ca3af', marginTop: 12 }}>Buscando horas disponibles…</p>
        </div>
      ) : fechas.length === 0 ? (
        <div style={s.emptyHoras}>
          <span style={{ fontSize: 40 }}>📅</span>
          <p>No hay horas disponibles para <strong>{especialidad}</strong> en este momento.</p>
        </div>
      ) : (
        <>
          {/* ── Selector de fecha ── */}
          <div style={s.dateNav}>
            {fechas.map(fecha => {
              const d = new Date(fecha);
              const isSelected = selectedDate === fecha;
              return (
                <button
                  key={fecha}
                  onClick={() => { setSelectedDate(fecha); setSelectedSlot(null); }}
                  style={{ ...s.dateBtn, ...(isSelected ? s.dateBtnActive : {}) }}
                >
                  <span style={s.dateMonth}>
                    {d.toLocaleDateString('es-CL', { month: 'short' })}
                  </span>
                  <span style={s.dateDay}>{d.getDate()}</span>
                  <span style={s.dateWeek}>
                    {d.toLocaleDateString('es-CL', { weekday: 'short' })}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Doctores y slots ── */}
          {Object.entries(porMedico).map(([medico, slots]) => (
            <div key={medico} style={s.doctorSection} className="doctor-card animate-fadeInUp">
              <div style={s.doctorHeader}>
                <div style={s.doctorAvatar}>{medico[0]}</div>
                <div>
                  <div style={s.doctorName}>{medico}</div>
                  <div style={s.doctorEsp}>{especialidad} · Hospital RedNorte</div>
                </div>
              </div>
              <div style={s.slotsGrid}>
                {slots.map(slot => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const time = new Date(slot.fecha_hora).toLocaleTimeString('es-CL',
                    { hour: '2-digit', minute: '2-digit' });
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(isSelected ? null : slot)}
                      style={{ ...s.slotBtn, ...(isSelected ? s.slotBtnActive : {}) }}
                      className={`slot-btn${isSelected ? ' selected' : ''}`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      <div style={s.stepFooter}>
        <button onClick={onBack} style={s.btnBack}>← Volver</button>
        <button
          onClick={onConfirmar}
          style={{ ...s.btnNext, opacity: selectedSlot ? 1 : 0.4 }}
          disabled={!selectedSlot}
          className="btn-animate"
        >
          Confirmar hora →
        </button>
      </div>
    </div>
  );
}

/* ── Modal de confirmación con login ─────────────────────────────────────── */
function ConfirmModal({ rut, tipo, especialidad, slot, onClose, onSuccess }) {
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [done, setDone]           = useState(false);

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!password) { setError('Ingresa tu contraseña para confirmar.'); return; }
    setLoading(true);
    setError('');
    try {
      // 1. Verificar identidad
      const authRes = await authService.login(rut, password);
      const token = authRes.data.accessToken;
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify({ rut, rol: authRes.data.rol, nombre: authRes.data.nombre }));

      // 2. Reservar la hora en agenda
      await agendaService.reservarHora(slot.id, {
        paciente_rut: rut,
        paciente_nombre: authRes.data.nombre || rut,
      });

      // 3. Crear solicitud en lista de espera
      await listaEsperaService.registrar({
        paciente_rut:    rut,
        paciente_nombre: authRes.data.nombre || rut,
        especialidad,
        tipo,
        hospital_origen: 'RedNorte',
        descripcion: `Reserva de hora — ${new Date(slot.fecha_hora).toLocaleString('es-CL')}`,
      });

      setDone(true);
      setTimeout(onSuccess, 2000);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Contraseña incorrecta. Verifica tus credenciales.'
          : err.response?.data?.error || 'Error al confirmar la reserva. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay} className="modal-overlay">
      <div style={s.modal} className="modal-card">
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 56 }}>✅</div>
            <h3 style={{ color: '#10b981', marginTop: 12 }}>¡Hora reservada!</h3>
            <p style={{ color: '#6b7280', marginTop: 8 }}>Redirigiendo a tus horas…</p>
          </div>
        ) : (
          <>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Confirmar reserva</h3>
              <button onClick={onClose} style={s.closeBtn}>✕</button>
            </div>

            {/* Resumen */}
            <div style={s.summaryBox}>
              <Row2 label="Especialidad" value={especialidad} />
              <Row2 label="Tipo"         value={TIPOS.find(t => t.id === tipo)?.label} />
              <Row2 label="Médico"       value={slot?.nombre_medico} />
              <Row2 label="Fecha/Hora"   value={slot ? new Date(slot.fecha_hora).toLocaleString('es-CL',
                { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'} />
              <Row2 label="Hospital"     value="RedNorte" />
            </div>

            <p style={s.confirmDesc}>
              Para confirmar la reserva, ingresa tu contraseña. Tu RUT es <strong>{rut}</strong>.
            </p>

            {error && <div style={s.errBox}>{error}</div>}

            <form onSubmit={handleConfirm}>
              <label style={s.label}>Contraseña</label>
              <input
                className="input-field"
                style={s.input}
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoFocus
              />
              <div style={s.modalFooter}>
                <button type="button" onClick={onClose} style={s.btnBack}>Cancelar</button>
                <button type="submit" style={s.btnNext} disabled={loading} className="btn-animate">
                  {loading ? 'Confirmando…' : 'Confirmar reserva'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Step Progress bar ───────────────────────────────────────────────────── */
function StepProgress({ step, steps }) {
  return (
    <div style={sp.wrap}>
      <div style={sp.label}>Paso {step}: {steps[step - 1]}</div>
      <div style={sp.track}>
        {steps.map((label, i) => {
          const num = i + 1;
          const done = num < step;
          const active = num === step;
          return (
            <div key={label} style={sp.item}>
              <div style={{ ...sp.circle, ...(done ? sp.done : active ? sp.active : sp.pending) }}
                   className={active ? 'step-active' : ''}>
                {done ? '✓' : num}
              </div>
              {i < steps.length - 1 && (
                <div style={{ ...sp.line, background: done ? '#0073b1' : '#e5e7eb' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
const sp = {
  wrap:    { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px' },
  label:   { fontSize: 13, color: '#6b7280', marginBottom: 12, fontWeight: 500, textAlign: 'center' },
  track:   { display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: 600, margin: '0 auto' },
  item:    { display: 'flex', alignItems: 'center', flex: 1 },
  circle:  { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
             justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 },
  done:    { background: '#0073b1', color: '#fff' },
  active:  { background: '#0073b1', color: '#fff', boxShadow: '0 0 0 4px rgba(0,115,177,0.25)' },
  pending: { background: '#e5e7eb', color: '#9ca3af' },
  line:    { flex: 1, height: 3, margin: '0 4px', borderRadius: 2, transition: 'background 0.3s' },
};

/* ── Helper ──────────────────────────────────────────────────────────────── */
function Row2({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                  borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );
}

/* ── Estilos ─────────────────────────────────────────────────────────────── */
const s = {
  page:         { minHeight: '100vh', background: '#f0f4f8', display: 'flex', flexDirection: 'column' },
  header:          { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px',
                     height: 60, display: 'flex', alignItems: 'center',
                     justifyContent: 'space-between', gap: 16 },
  backBtn:         { background: 'none', border: 'none', color: '#0073b1', cursor: 'pointer',
                     fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 },
  headerNav:       { display: 'flex', alignItems: 'center', gap: 4, flex: 1,
                     justifyContent: 'center' },
  headerNavBtn:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                     background: 'none', border: 'none', cursor: 'pointer',
                     padding: '6px 14px', borderRadius: 8,
                     transition: 'background 0.15s' },
  headerNavIcon:   { fontSize: 18 },
  headerNavLabel:  { fontSize: 11, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  headerBrandWrap: { display: 'flex', alignItems: 'baseline', gap: 6, flexShrink: 0 },
  headerBrand:     { fontSize: 16, fontWeight: 800, color: '#0073b1' },
  headerSep:       { color: '#d1d5db' },
  headerSub:       { fontSize: 13, color: '#9ca3af' },
  progressWrap: { background: '#fff' },
  main:         { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
                  padding: '32px 24px' },
  panel:        { background: '#fff', borderRadius: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  padding: '36px 40px', width: '100%', maxWidth: 680 },

  stepContent:  { display: 'flex', flexDirection: 'column', gap: 0 },
  stepIcon:     { fontSize: 44, textAlign: 'center', marginBottom: 8 },
  stepTitle:    { fontSize: 22, fontWeight: 800, color: '#1a1a2e', textAlign: 'center', marginBottom: 8 },
  stepDesc:     { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginBottom: 28 },
  stepFooter:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: 32, paddingTop: 20, borderTop: '1px solid #f1f5f9' },

  formGroup:    { marginBottom: 8 },
  label:        { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 },
  input:        { width: '100%', padding: '12px 14px', border: '1.5px solid #d1d5db',
                  borderRadius: 8, fontSize: 15, background: '#fafafa', boxSizing: 'border-box' },
  inputErr:     { borderColor: '#ef4444' },
  errText:      { color: '#ef4444', fontSize: 12, marginTop: 6 },
  preselChip:   { background: '#eff6ff', border: '1.5px solid #0073b1', borderRadius: 8,
                  padding: '10px 14px', fontSize: 13, color: '#1e40af', marginBottom: 20,
                  display: 'flex', alignItems: 'center', gap: 8 },
  preselDot:    { background: '#0073b1', color: '#fff', borderRadius: '50%', width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0 },

  btnNext:      { background: '#0073b1', color: '#fff', border: 'none', padding: '11px 28px',
                  borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  btnBack:      { background: 'none', border: '1.5px solid #d1d5db', color: '#374151',
                  padding: '11px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14 },

  espGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 12, marginBottom: 8 },
  espCard:      { border: '2px solid #e5e7eb', borderRadius: 10, padding: '18px 12px', background: '#fafafa',
                  cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 8 },
  espCardActive:{ borderColor: '#0073b1', background: '#eff6ff' },
  espIcon:      { fontSize: 28 },
  espName:      { fontSize: 13, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3 },

  tipoGrid:     { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 8 },
  tipoCard:     { border: '2px solid #e5e7eb', borderRadius: 12, padding: '20px 16px', background: '#fafafa',
                  cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6 },
  tipoActive:   { borderColor: '#0073b1', background: '#eff6ff' },
  tipoIcon:     { fontSize: 28 },
  tipoLabel:    { fontSize: 14, fontWeight: 700, color: '#1a1a2e' },
  tipoDesc:     { fontSize: 12, color: '#9ca3af', lineHeight: 1.4 },

  // Step 4
  dateNav:      { display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 },
  dateBtn:      { border: '2px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', background: '#fafafa',
                  cursor: 'pointer', textAlign: 'center', minWidth: 70, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  dateBtnActive:{ borderColor: '#0073b1', background: '#eff6ff' },
  dateMonth:    { fontSize: 10, textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600 },
  dateDay:      { fontSize: 22, fontWeight: 800, color: '#1a1a2e' },
  dateWeek:     { fontSize: 10, color: '#9ca3af' },

  doctorSection:{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px',
                  marginBottom: 16, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  doctorHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  doctorAvatar: { width: 42, height: 42, borderRadius: '50%', background: '#0073b1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 },
  doctorName:   { fontSize: 15, fontWeight: 700, color: '#1a1a2e' },
  doctorEsp:    { fontSize: 12, color: '#9ca3af' },
  slotsGrid:    { display: 'flex', flexWrap: 'wrap', gap: 8 },
  slotBtn:      { border: '1.5px solid #0073b1', color: '#0073b1', background: '#fff',
                  padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  slotBtnActive:{ background: '#0073b1', color: '#fff' },

  emptyHoras:   { textAlign: 'center', padding: '40px 0', color: '#9ca3af', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: 12 },
  spinner:      { width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#0073b1',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' },

  // Modal
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal:        { background: '#fff', borderRadius: 14, padding: '28px 32px',
                  width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.3)' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:   { fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  closeBtn:     { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af' },
  summaryBox:   { background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10,
                  padding: '14px 16px', marginBottom: 18 },
  confirmDesc:  { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  errBox:       { background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13 },
  modalFooter:  { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
};
