const router = require('express').Router();
const repository = require('../repositories/agendaRepository');
const { publish, EVENTS } = require('../../../../shared/events/rabbitmq');
const { verifyToken, requireRole } = require('../../../../shared/middleware/auth');

// Listar horas disponibles (público para ms-reasignacion)
router.get('/horas/disponibles', async (req, res) => {
  try {
    const { especialidad, fecha_desde, fecha_hasta, medico_rut, limit } = req.query;
    const data = await repository.findHorasDisponibles({ especialidad, fecha_desde, fecha_hasta, medico_rut, limit: parseInt(limit) || 100 });
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/horas/:id', verifyToken, async (req, res) => {
  try {
    const hora = await repository.findById(req.params.id);
    if (!hora) return res.status(404).json({ ok: false, error: 'Hora no encontrada' });
    res.json({ ok: true, data: hora });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/horas', verifyToken, requireRole('admin', 'medico'), async (req, res) => {
  try {
    const hora = await repository.createHora(req.body);
    publish(EVENTS.HORA_DISPONIBLE, {
      hora_id: hora.id,
      especialidad: hora.especialidad,
      fecha_hora: hora.fecha_hora,
    });
    res.status(201).json({ ok: true, data: hora });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Reservar hora — llamado interno desde ms-reasignacion
router.patch('/horas/:id/reservar', async (req, res) => {
  try {
    const hora = await repository.reservar(req.params.id, req.body);
    res.json({ ok: true, data: hora });
  } catch (err) {
    const status = err.message.includes('no disponible') ? 409 : 500;
    res.status(status).json({ ok: false, error: err.message });
  }
});

// Liberar hora (al cancelar)
router.patch('/horas/:id/liberar', verifyToken, requireRole('admin', 'medico'), async (req, res) => {
  try {
    const hora = await repository.liberar(req.params.id);
    if (!hora) return res.status(404).json({ ok: false, error: 'Hora no encontrada' });
    publish(EVENTS.HORA_DISPONIBLE, {
      hora_id: hora.id,
      especialidad: hora.especialidad,
      fecha_hora: hora.fecha_hora,
    });
    res.json({ ok: true, data: hora });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/medicos', verifyToken, async (req, res) => {
  try {
    const data = await repository.findMedicos({ especialidad: req.query.especialidad });
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
