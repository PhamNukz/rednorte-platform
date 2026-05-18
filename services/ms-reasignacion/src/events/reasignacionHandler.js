const axios = require('axios');
const CircuitBreaker = require('../../../../shared/middleware/circuitBreaker');
const { publish, EVENTS } = require('../../../../shared/events/rabbitmq');
const { generateServiceToken } = require('../../../../shared/middleware/auth');
const repository = require('../repositories/reasignacionRepository');

// Circuit Breakers para llamadas HTTP a otros microservicios
const cbAgenda = new CircuitBreaker('ms-agenda-medica', { failureThreshold: 3, timeout: 20000 });
const cbLista  = new CircuitBreaker('ms-lista-espera',  { failureThreshold: 3, timeout: 20000 });

const MS_AGENDA_URL = process.env.MS_AGENDA_URL || 'http://ms-agenda-medica:3004';
const MS_LISTA_URL  = process.env.MS_LISTA_URL  || 'http://ms-lista-espera:3001';

// Token de servicio generado una vez al inicio (válido 365 días)
const SERVICE_TOKEN = generateServiceToken('ms-reasignacion');
const authHeader = () => ({ Authorization: `Bearer ${SERVICE_TOKEN}` });

/**
 * Handler: al detectar 'cita.cancelada', busca el siguiente paciente elegible
 * y reasigna la hora liberada.
 */
async function handleCitaCancelada(payload) {
  const { solicitud_id, paciente_id, especialidad, hora_asignada_id, timestamp } = payload;
  console.log(`[ms-reasignacion] Procesando cancelación de ${solicitud_id}`);

  let reasignacion = null;
  try {
    // 1. Buscar siguiente paciente elegible
    const siguienteResp = await cbLista.call(() =>
      axios.get(`${MS_LISTA_URL}/solicitudes/siguiente-elegible`, {
        params: { especialidad },
        headers: authHeader(),
        timeout: 5000,
      })
    );
    const siguiente = siguienteResp.data?.data;
    if (!siguiente) {
      console.log(`[ms-reasignacion] Sin pacientes en espera para ${especialidad}`);
      return;
    }

    // 2. Consultar hora disponible en agenda
    const horaResp = await cbAgenda.call(() =>
      axios.get(`${MS_AGENDA_URL}/horas/disponibles`, {
        params: { especialidad, limit: 1 },
        headers: authHeader(),
        timeout: 5000,
      })
    );
    const hora = horaResp.data?.data?.[0];
    if (!hora) {
      console.log(`[ms-reasignacion] Sin horas disponibles para ${especialidad}`);
      return;
    }

    // 3. Registrar reasignación en BD propia
    reasignacion = await repository.create({
      solicitud_id: siguiente.id,
      paciente_id: siguiente.paciente_id,
      hora_anterior_id: hora_asignada_id || null,
      hora_nueva_id: hora.id,
      especialidad,
      motivo: `Reasignación automática por cancelación de cita ${solicitud_id}`,
      fecha_evento: timestamp,
    });

    // 4. Reservar hora en ms-agenda-medica
    await cbAgenda.call(() =>
      axios.patch(`${MS_AGENDA_URL}/horas/${hora.id}/reservar`, {
        paciente_rut: siguiente.rut_paciente,
        paciente_nombre: siguiente.nombre_paciente,
      }, { headers: authHeader(), timeout: 5000 })
    );

    // 5. Actualizar estado de la solicitud a 'asignada' en ms-lista-espera
    await cbLista.call(() =>
      axios.patch(`${MS_LISTA_URL}/solicitudes/${siguiente.id}/estado`, {
        estado: 'asignada',
        comentario: `Hora ${hora.id} asignada automáticamente por reasignación`,
      }, { headers: authHeader(), timeout: 5000 })
    );

    // 6. Notificar al paciente
    publish(EVENTS.NOTIFICACION_REQUERIDA, {
      paciente_id: siguiente.paciente_id,
      tipo: 'reasignacion',
      mensaje: `Tu cita de ${especialidad} fue confirmada para ${hora.fecha_hora}`,
      canal: ['email', 'push'],
    });

    await repository.updateEstado(reasignacion.id, 'completada');
    console.log(`[ms-reasignacion] Reasignación completada: solicitud ${siguiente.id} → hora ${hora.id}`);
  } catch (err) {
    console.error('[ms-reasignacion] Error en reasignación (cancelada):', err.message);
    if (reasignacion) await repository.updateEstado(reasignacion.id, 'fallida');
  }
}

/**
 * Handler: al detectar 'paciente.registrado', intenta asignar una hora disponible
 * de inmediato. Si no hay horas, actualiza el estado a 'en_espera'.
 */
async function handlePacienteRegistrado(payload) {
  const { solicitud_id, paciente_id, especialidad, prioridad, timestamp } = payload;
  console.log(`[ms-reasignacion] Nueva solicitud recibida: ${solicitud_id} — ${especialidad}`);

  let reasignacion = null;
  try {
    // 1. Buscar hora disponible para la especialidad
    const horaResp = await cbAgenda.call(() =>
      axios.get(`${MS_AGENDA_URL}/horas/disponibles`, {
        params: { especialidad, limit: 1 },
        headers: authHeader(),
        timeout: 5000,
      })
    );
    const hora = horaResp.data?.data?.[0];

    if (!hora) {
      // Sin hora disponible → dejar en lista de espera
      await cbLista.call(() =>
        axios.patch(`${MS_LISTA_URL}/solicitudes/${solicitud_id}/estado`, {
          estado: 'en_espera',
          comentario: 'Sin horas disponibles al momento del registro. En lista de espera.',
        }, { headers: authHeader(), timeout: 5000 })
      );
      console.log(`[ms-reasignacion] Solicitud ${solicitud_id} en lista de espera (sin horas para ${especialidad})`);
      return;
    }

    // 2. Registrar asignación en BD propia
    reasignacion = await repository.create({
      solicitud_id,
      paciente_id,
      hora_anterior_id: null,
      hora_nueva_id: hora.id,
      especialidad,
      motivo: `Asignación automática al registrar solicitud ${solicitud_id}`,
      fecha_evento: timestamp,
    });

    // 3. Reservar la hora en ms-agenda-medica (solicitud_id y paciente_id vienen del evento)
    await cbAgenda.call(() =>
      axios.patch(`${MS_AGENDA_URL}/horas/${hora.id}/reservar`, {
        solicitud_id,
        paciente_id,
      }, { headers: authHeader(), timeout: 5000 })
    );

    // 5. Actualizar solicitud a 'asignada'
    await cbLista.call(() =>
      axios.patch(`${MS_LISTA_URL}/solicitudes/${solicitud_id}/estado`, {
        estado: 'asignada',
        comentario: `Hora ${hora.id} asignada automáticamente al registrar solicitud`,
      }, { headers: authHeader(), timeout: 5000 })
    );

    // 6. Notificar al paciente
    publish(EVENTS.NOTIFICACION_REQUERIDA, {
      paciente_id,
      tipo: 'asignacion',
      mensaje: `Tu solicitud de ${especialidad} tiene hora confirmada para ${hora.fecha_hora}`,
      canal: ['email', 'push'],
    });

    await repository.updateEstado(reasignacion.id, 'completada');
    console.log(`[ms-reasignacion] Asignación directa completada: solicitud ${solicitud_id} → hora ${hora.id}`);
  } catch (err) {
    console.error('[ms-reasignacion] Error en asignación (registrado):', err.message);
    if (reasignacion) await repository.updateEstado(reasignacion.id, 'fallida');
    // Asegurar que quede en_espera si hubo error después de intentar
    try {
      await axios.patch(`${MS_LISTA_URL}/solicitudes/${solicitud_id}/estado`, {
        estado: 'en_espera',
        comentario: 'Error en asignación automática. Solicitud en lista de espera.',
      }, { headers: authHeader(), timeout: 5000 });
    } catch (_) { /* silent — estado fallback */ }
  }
}

module.exports = { handleCitaCancelada, handlePacienteRegistrado };
