import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { agendaService, listaEsperaService, authService } from '../services/api';
import { validarRut, limpiarRut, formatearRutInput } from '../utils/rut';

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
  const [err, setErr]               = useState('');
  const [checking, setChecking]     = useState(false);
  const [mode, setMode]             = useState('rut'); // 'rut' | 'register'
  const [regForm, setRegForm]       = useState({ nombre: '', email: '', telefono: '', password: '', confirm: '' });
  const [registering, setRegist]    = useState(false);
  const [regErr, setRegErr]         = useState('');

  const setReg = (k, v) => setRegForm(f => ({ ...f, [k]: v }));

  const handleRutChange = (e) => {
    const formatted = formatearRutInput(e.target.value);
    setRut(formatted);
    setErr('');
  };

  const handleCheckRut = async () => {
    const clean = limpiarRut(rut);
    if (!clean) { setErr('Ingresa tu RUT para continuar.'); return; }
    if (!validarRut(clean)) {
      setErr('RUT inválido. Verifica el formato y el dígito verificador (Ej: 12345678-9).');
      return;
    }
    setChecking(true);
    try {
      const res = await authService.checkRut(clean);
      if (res.data.exists) {
        setRut(clean);
        onNext();
      } else {
        setMode('register');
        setRut(clean);
      }
    } catch {
      setErr('Error al verificar el RUT. Intenta nuevamente.');
    } finally {
      setChecking(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.nombre.trim()) { setRegErr('El nombre es obligatorio.'); return; }
    if (regForm.password.length < 6) { setRegErr('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (regForm.password !== regForm.confirm) { setRegErr('Las contraseñas no coinciden.'); return; }
    setRegist(true);
    setRegErr('');
    try {
      await authService.register({
        rut,
        nombre: regForm.nombre,
        email: regForm.email || undefined,
        telefono: regForm.telefono || undefined,
        password: regForm.password,
      });
      onNext();
    } catch (err) {
      setRegErr(err.response?.data?.error || 'Error al crear la cuenta. Intenta nuevamente.');
    } finally {
      setRegist(false);
    }
  };

  if (mode === 'register') {
    return (
      <div style={s.stepContent}>
        <div style={s.stepIcon}>👤</div>
        <h2 style={s.stepTitle}>Crear cuenta</h2>
        <p style={s.stepDesc}>
          El RUT <strong>{rut}</strong> no tiene cuenta aún. Completa tus datos para continuar.
        </p>

        {regErr && (
          <div style={sr.errBox} className="error-box animate-fadeIn">
            <span>⚠</span> {regErr}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={s.formGroup}>
            <label style={s.label}>Nombre completo <span style={sr.req}>*</span></label>
            <input
              className="input-field" style={s.input} type="text"
              placeholder="Ej: Juan Pérez González"
              value={regForm.nombre} onChange={e => setReg('nombre', e.target.value)}
              autoFocus required
            />
          </div>
          <div style={sr.row2}>
            <div>
              <label style={s.label}>Correo electrónico</label>
              <input
                className="input-field" style={s.input} type="email"
                placeholder="correo@ejemplo.cl"
                value={regForm.email} onChange={e => setReg('email', e.target.value)}
              />
            </div>
            <div>
              <label style={s.label}>Teléfono</label>
              <input
                className="input-field" style={s.input} type="tel"
                placeholder="+56 9 1234 5678"
                value={regForm.telefono} onChange={e => setReg('telefono', e.target.value)}
              />
            </div>
          </div>
          <div style={sr.row2}>
            <div>
              <label style={s.label}>Contraseña <span style={sr.req}>*</span></label>
              <input
                className="input-field" style={s.input} type="password"
                placeholder="Mínimo 6 caracteres"
                value={regForm.password} onChange={e => setReg('password', e.target.value)}
                required
              />
            </div>
            <div>
              <label style={s.label}>Confirmar contraseña <span style={sr.req}>*</span></label>
              <input
                className="input-field" style={s.input} type="password"
                placeholder="Repite la contraseña"
                value={regForm.confirm} onChange={e => setReg('confirm', e.target.value)}
                required
              />
            </div>
          </div>

          <div style={sr.infoBox}>
            <span>ℹ</span> Recuerda esta contraseña para confirmar futuras reservas.
          </div>

          <div style={s.stepFooter}>
            <button type="button" onClick={() => { setMode('rut'); setRegErr(''); }} style={s.btnBack}>
              ← Volver
            </button>
            <button type="submit" style={s.btnNext} disabled={registering} className="btn-animate">
              {registering ? <><span className="spinner" />Creando cuenta…</> : 'Crear cuenta y continuar →'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={s.stepContent}>
      <div style={s.stepIcon}>🪪</div>
      <h2 style={s.stepTitle}>¿Para quién es la hora?</h2>
      <p style={s.stepDesc}>Ingresa el RUT del paciente que será atendido</p>

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
          placeholder="Ej: 12345678-9"
          value={rut}
          onChange={handleRutChange}
          onKeyDown={e => e.key === 'Enter' && handleCheckRut()}
          autoFocus
          maxLength={10}
        />
        {err && <p style={s.errText}>{err}</p>}
        <p style={sr.hint}>Formato: sin puntos, con guion antes del dígito verificador</p>
      </div>
      <div style={s.stepFooter}>
        <button onClick={onCancel} style={s.btnBack}>Cancelar</button>
        <button onClick={handleCheckRut} style={s.btnNext} disabled={checking} className="btn-animate">
          {checking ? <><span className="spinner" />Verificando…</> : 'Continuar →'}
        </button>
      </div>
    </div>
  );
}

/* Estilos locales del StepRut */
const sr = {
  req:    { color: '#ef4444' },
  hint:   { fontSize: 12, color: '#94a3b8', marginTop: 6 },
  row2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 },
  errBox: { background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#dc2626',
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 },
  infoBox:{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10,
            padding: '10px 14px', marginTop: 8, fontSize: 12, color: '#0369a1',
            display: 'flex', alignItems: 'center', gap: 8 },
};

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
    let solicitudId = null;
    try {
      // 1. Verificar identidad — si falla aquí, nada queda reservado
      const authRes = await authService.login(rut, password);
      const token = authRes.data.accessToken;
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify({ rut, rol: authRes.data.rol, nombre: authRes.data.nombre }));

      // 2. Crear solicitud primero — no bloquea ninguna hora
      const solRes = await listaEsperaService.registrar({
        paciente_id:     authRes.data.id,
        rut_paciente:    rut,
        nombre_paciente: authRes.data.nombre || rut,
        especialidad,
        tipo:            tipo.toLowerCase(),
        hospital_origen: 'RedNorte',
        descripcion: `Reserva de hora — ${new Date(slot.fecha_hora).toLocaleString('es-CL')}`,
      });
      solicitudId = solRes.data.data?.id;

      // 3. Reservar la hora — solo después de que la solicitud existe
      await agendaService.reservarHora(slot.id, {
        paciente_rut: rut,
        paciente_nombre: authRes.data.nombre || rut,
      });

      setDone(true);
      setTimeout(onSuccess, 2000);
    } catch (err) {
      // Si la solicitud fue creada pero la hora no pudo reservarse → cancelar solicitud
      if (solicitudId) {
        listaEsperaService.actualizarEstado(solicitudId, 'cancelada', 'Hora no disponible al confirmar')
          .catch(() => {});
      }
      const status = err.response?.status;
      setError(
        status === 401
          ? 'Contraseña incorrecta. Verifica tus credenciales.'
          : status === 409
          ? 'Esta hora ya no está disponible. Por favor elige otro horario.'
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
      <div style={sp.label}>
        <span style={sp.stepChip}>Paso {step} de {steps.length}</span>
        {steps[step - 1]}
      </div>
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
                <div style={{
                  ...sp.line,
                  background: done
                    ? 'linear-gradient(90deg,#0073b1,#06b6d4)'
                    : '#e2e8f0',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
const sp = {
  wrap:     { background: '#fff', borderBottom: '1px solid #e8edf3', padding: '14px 28px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.04)' },
  label:    { fontSize: 13, color: '#64748b', marginBottom: 14, fontWeight: 500,
              textAlign: 'center', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8 },
  stepChip: { background: '#eff6ff', color: '#0073b1', borderRadius: 20,
              padding: '2px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.3px' },
  track:    { display: 'flex', alignItems: 'center', justifyContent: 'center',
              maxWidth: 600, margin: '0 auto' },
  item:     { display: 'flex', alignItems: 'center', flex: 1 },
  circle:   { width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0,
              transition: 'all 0.24s ease' },
  done:     { background: 'linear-gradient(135deg,#0073b1,#06b6d4)', color: '#fff',
              boxShadow: '0 2px 8px rgba(0,115,177,0.3)' },
  active:   { background: 'linear-gradient(135deg,#0073b1,#0084cc)', color: '#fff',
              boxShadow: '0 0 0 5px rgba(0,115,177,0.18)' },
  pending:  { background: '#f1f5f9', color: '#94a3b8', border: '2px solid #e2e8f0' },
  line:     { flex: 1, height: 3, margin: '0 4px', borderRadius: 2, transition: 'background 0.35s ease' },
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
  page:         { minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' },
  header:          { background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(16px)',
                     borderBottom: '1px solid #e8edf3', padding: '0 28px',
                     height: 60, display: 'flex', alignItems: 'center',
                     justifyContent: 'space-between', gap: 16,
                     boxShadow: '0 1px 10px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 50 },
  backBtn:         { background: 'none', border: 'none', color: '#0073b1', cursor: 'pointer',
                     fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 },
  headerNav:       { display: 'flex', alignItems: 'center', gap: 2, flex: 1,
                     justifyContent: 'center' },
  headerNavBtn:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                     background: 'none', border: 'none', cursor: 'pointer',
                     padding: '7px 14px', borderRadius: 9,
                     transition: 'background 0.15s' },
  headerNavIcon:   { fontSize: 18 },
  headerNavLabel:  { fontSize: 11, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  headerBrandWrap: { display: 'flex', alignItems: 'baseline', gap: 6, flexShrink: 0 },
  headerBrand:     { fontSize: 16, fontWeight: 900, color: '#0073b1', letterSpacing: '-0.4px' },
  headerSep:       { color: '#d1d5db' },
  headerSub:       { fontSize: 13, color: '#94a3b8' },
  progressWrap: { background: '#fff' },
  main:         { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
                  padding: '32px 24px' },
  panel:        { background: '#fff', borderRadius: 20,
                  boxShadow: '0 8px 40px rgba(0,0,0,0.09)',
                  padding: '38px 44px', width: '100%', maxWidth: 680,
                  border: '1px solid #e8edf3' },

  stepContent:  { display: 'flex', flexDirection: 'column', gap: 0 },
  stepIcon:     { fontSize: 46, textAlign: 'center', marginBottom: 8 },
  stepTitle:    { fontSize: 23, fontWeight: 900, color: '#0f172a', textAlign: 'center',
                  marginBottom: 8, letterSpacing: '-0.5px' },
  stepDesc:     { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 28, lineHeight: 1.6 },
  stepFooter:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: 32, paddingTop: 20, borderTop: '1px solid #f1f5f9' },

  formGroup:    { marginBottom: 8 },
  label:        { display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 },
  input:        { width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0',
                  borderRadius: 10, fontSize: 15, background: '#f8fafc', boxSizing: 'border-box',
                  color: '#0f172a', outline: 'none' },
  inputErr:     { borderColor: '#ef4444', background: '#fef2f2' },
  errText:      { color: '#ef4444', fontSize: 12, marginTop: 6 },
  preselChip:   { background: 'linear-gradient(135deg,#eff6ff,#f0f9ff)',
                  border: '1.5px solid #bfdbfe', borderRadius: 10,
                  padding: '10px 16px', fontSize: 13, color: '#1e40af', marginBottom: 20,
                  display: 'flex', alignItems: 'center', gap: 8 },
  preselDot:    { background: 'linear-gradient(135deg,#0073b1,#06b6d4)', color: '#fff',
                  borderRadius: '50%', width: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, flexShrink: 0 },

  btnNext:      { background: 'linear-gradient(135deg,#0073b1,#005a8e)', color: '#fff', border: 'none',
                  padding: '12px 30px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 800,
                  boxShadow: '0 4px 16px rgba(0,115,177,0.3)', letterSpacing: '0.1px' },
  btnBack:      { background: 'none', border: '1.5px solid #e2e8f0', color: '#374151',
                  padding: '12px 22px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500 },

  espGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 12, marginBottom: 8 },
  espCard:      { border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '18px 12px', background: '#f8fafc',
                  cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 8 },
  espCardActive:{ borderColor: '#0073b1', background: '#eff6ff',
                  boxShadow: '0 0 0 3px rgba(0,115,177,0.14)' },
  espIcon:      { fontSize: 28 },
  espName:      { fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 },

  tipoGrid:     { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 8 },
  tipoCard:     { border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '22px 18px', background: '#f8fafc',
                  cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6 },
  tipoActive:   { borderColor: '#0073b1', background: '#eff6ff',
                  boxShadow: '0 0 0 3px rgba(0,115,177,0.14)' },
  tipoIcon:     { fontSize: 28 },
  tipoLabel:    { fontSize: 14, fontWeight: 800, color: '#0f172a' },
  tipoDesc:     { fontSize: 12, color: '#94a3b8', lineHeight: 1.5 },

  // Step 4
  dateNav:      { display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 },
  dateBtn:      { border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', background: '#f8fafc',
                  cursor: 'pointer', textAlign: 'center', minWidth: 72, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  transition: 'all 0.16s ease' },
  dateBtnActive:{ borderColor: '#0073b1', background: '#eff6ff',
                  boxShadow: '0 0 0 3px rgba(0,115,177,0.14)' },
  dateMonth:    { fontSize: 10, textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700,
                  letterSpacing: '0.6px' },
  dateDay:      { fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' },
  dateWeek:     { fontSize: 10, color: '#94a3b8', fontWeight: 500 },

  doctorSection:{ border: '1px solid #e8edf3', borderRadius: 14, padding: '20px 22px',
                  marginBottom: 16, background: '#fff',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  doctorHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 },
  doctorAvatar: { width: 44, height: 44, borderRadius: 14,
                  background: 'linear-gradient(135deg,#0073b1,#0084cc)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 16, flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,115,177,0.28)' },
  doctorName:   { fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px' },
  doctorEsp:    { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  slotsGrid:    { display: 'flex', flexWrap: 'wrap', gap: 8 },
  slotBtn:      { border: '1.5px solid #0073b1', color: '#0073b1', background: '#fff',
                  padding: '7px 16px', borderRadius: 9, cursor: 'pointer', fontSize: 13,
                  fontWeight: 700, transition: 'all 0.14s ease' },
  slotBtnActive:{ background: 'linear-gradient(135deg,#0073b1,#005a8e)', color: '#fff',
                  boxShadow: '0 3px 10px rgba(0,115,177,0.32)' },

  emptyHoras:   { textAlign: 'center', padding: '40px 0', color: '#94a3b8', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: 12 },
  spinner:      { width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0073b1',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' },

  // Modal
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal:        { background: '#fff', borderRadius: 20, padding: '30px 34px',
                  width: '100%', maxWidth: 480, boxShadow: '0 32px 96px rgba(0,0,0,0.3)' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:   { fontSize: 19, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' },
  closeBtn:     { background: '#f1f5f9', border: 'none', fontSize: 14, cursor: 'pointer',
                  color: '#64748b', width: 30, height: 30, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' },
  summaryBox:   { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
                  padding: '14px 18px', marginBottom: 18 },
  confirmDesc:  { fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 1.6 },
  errBox:       { background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                  borderLeft: '4px solid #ef4444', borderRadius: 10,
                  padding: '10px 14px', marginBottom: 14, fontSize: 13 },
  modalFooter:  { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
};
