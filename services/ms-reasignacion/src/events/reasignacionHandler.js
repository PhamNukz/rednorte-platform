const axios = require('axios');
const CircuitBreaker = require('../../../../shared/middleware/circuitBreaker');
const { publish, EVENTS } = require('../../../../shared/events/rabbitmq');
const repository = require('../repositories/reasignacionRepository');

// Circuit Breakers para llamadas HTTP a otros microservicios
const cbAgenda = new CircuitBreaker('ms-agenda-medica', { failureThreshold: 3, timeout: 20000 });
const cbLista  = new CircuitBreaker('ms-lista-espera',  { failureThreshold: 3, timeout: 20000 });

const MS_AGENDA_URL = process.env.MS_AGENDA_URL || 'http://ms-agenda-medica:3004';
const MS_LISTA_URL  = process.env.MS_LISTA_URL  || 'http://ms-lista-espera:3001';

/**
 * Handler principal: al detectar 'cita.cancelada', busca el siguiente
 * paciente elegible y reasigna la hora liberada.
 */
async function handleCitaCancelada(payload) {
  const { solicitud_id, paciente_id, especialidad, hora_asignada_id, timestamp } = payload;
  console.log(`[ms-reasignacion] Procesando cancelación de ${solicitud_id}`);

  let reasignacion = null;
  try {
    // 1. Buscar siguiente paciente elegible (vía HTTP con Circuit Breaker)
    const siguienteResp = await cbLista.call(() =>
      axios.get(`${MS_LISTA_URL}/solicitudes/siguiente-elegible`, {
        params: { especialidad },
        headers: { 'x-service': 'ms-reasignacion' },
        timeout: 5000,
      })
    );
    const siguiente = siguienteResp.data?.data;
    if (!siguiente) {
      console.log(`[ms-reasignacion] Sin pacientes en espera para ${especialidad}`);
      return;
    }

    // 2. Consultar hora disponible en agenda (con Circuit Breaker)
    const horaResp = await cbAgenda.call(() =>
      axios.get(`${MS_AGENDA_URL}/horas/disponibles`, {
        params: { especialidad, limit: 1 },
        headers: { 'x-service': 'ms-reasignacion' },
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
        solicitud_id: siguiente.id,
        paciente_id: siguiente.paciente_id,
      }, { headers: { 'x-service': 'ms-reasignacion' }, timeout: 5000 })
    );

    // 5. Publicar evento para que ms-lista-espera actualice el estado
    publish(EVENTS.CITA_REASIGNADA, {
      solicitud_id: siguiente.id,
      paciente_id: siguiente.paciente_id,
      hora_id: hora.id,
      especialidad,
    });

    // 6. Publicar evento para que ms-notificaciones avise al paciente
    publish(EVENTS.NOTIFICACION_REQUERIDA, {
      paciente_id: siguiente.paciente_id,
      tipo: 'reasignacion',
      mensaje: `Tu cita de ${especialidad} fue confirmada para ${hora.fecha_hora}`,
      canal: ['email', 'push'],
    });

    await repository.updateEstado(reasignacion.id, 'completada');
    console.log(`[ms-reasignacion] Reasignación completada: solicitud ${siguiente.id} → hora ${hora.id}`);
  } catch (err) {
    console.error('[ms-reasignacion] Error en reasignación:', err.message);
    if (reasignacion) await repository.updateEstado(reasignacion.id, 'fallida');
  }
}

module.exports = { handleCitaCancelada };
