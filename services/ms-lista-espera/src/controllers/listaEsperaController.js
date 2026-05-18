const repository = require('../repositories/listaEsperaRepository');
const SolicitudFactory = require('../factories/solicitudFactory');
const { publish, EVENTS } = require('../../../../shared/events/rabbitmq');

const listaEsperaController = {
  // CQRS — COMMAND: registrar nueva solicitud
  async registrar(req, res) {
    try {
      const solicitudData = SolicitudFactory.create(req.body.tipo, {
        ...req.body,
        creado_por: req.user.id,
      });
      const solicitud = await repository.create(solicitudData);

      publish(EVENTS.PACIENTE_REGISTRADO, {
        solicitud_id: solicitud.id,
        paciente_id: solicitud.paciente_id,
        especialidad: solicitud.especialidad,
        prioridad: solicitud.prioridad,
      });

      res.status(201).json({ ok: true, data: solicitud });
    } catch (err) {
      const status = err.message.includes('requerido') ? 400 : 500;
      res.status(status).json({ ok: false, error: err.message });
    }
  },

  // CQRS — QUERY: listar con filtros
  async listar(req, res) {
    try {
      const { estado, especialidad, prioridad, limit, offset } = req.query;
      const filters = {
        estado, especialidad, prioridad,
        limit: parseInt(limit) || 100,
        offset: parseInt(offset) || 0,
      };
      // Pacientes solo ven sus propias solicitudes
      if (req.user.rol === 'paciente') {
        filters.paciente_id = req.user.id;
      }
      const data = await repository.findAll(filters);
      res.json({ ok: true, data, total: data.length });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },

  // CQRS — QUERY: detalle de una solicitud
  async obtener(req, res) {
    try {
      const solicitud = await repository.findById(req.params.id);
      if (!solicitud) return res.status(404).json({ ok: false, error: 'No encontrada' });
      res.json({ ok: true, data: solicitud });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },

  // CQRS — COMMAND: actualizar estado
  async actualizarEstado(req, res) {
    try {
      const { estado, comentario } = req.body;
      if (!estado) return res.status(400).json({ ok: false, error: 'Estado requerido' });

      const actualizada = await repository.updateEstado(
        req.params.id, estado, req.user.id, comentario
      );
      if (!actualizada) return res.status(404).json({ ok: false, error: 'No encontrada' });

      if (estado === 'cancelada') {
        publish(EVENTS.CITA_CANCELADA, {
          solicitud_id: actualizada.id,
          paciente_id: actualizada.paciente_id,
          especialidad: actualizada.especialidad,
          hora_asignada_id: actualizada.hora_asignada_id,
        });
      }

      res.json({ ok: true, data: actualizada });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },

  // CQRS — QUERY: historial de estados
  async historial(req, res) {
    try {
      const data = await repository.getHistorial(req.params.id);
      res.json({ ok: true, data });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },

  // CQRS — QUERY: resumen por estado (usado por ms-reportes)
  async resumen(req, res) {
    try {
      const data = await repository.countByEstado();
      res.json({ ok: true, data });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },

  // CQRS — QUERY: siguiente paciente elegible por especialidad (usado por ms-reasignacion)
  async siguienteElegible(req, res) {
    try {
      const { especialidad } = req.query;
      if (!especialidad) return res.status(400).json({ ok: false, error: 'especialidad requerida' });
      const data = await repository.getSiguienteElegible(especialidad);
      res.json({ ok: true, data });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },
};

module.exports = listaEsperaController;
