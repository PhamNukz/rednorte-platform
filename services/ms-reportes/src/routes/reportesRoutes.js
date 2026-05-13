const router = require('express').Router();
const repository = require('../repositories/reportesRepository');
const { verifyToken, requireRole } = require('../../../../shared/middleware/auth');

const onlyAdmin = [verifyToken, requireRole('admin', 'medico')];

router.get('/dashboard', ...onlyAdmin, async (req, res) => {
  try {
    const data = await repository.dashboardResumen();
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/solicitudes/estados', ...onlyAdmin, async (req, res) => {
  try {
    res.json({ ok: true, data: await repository.solicitudesPorEstado() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/solicitudes/espera-por-especialidad', ...onlyAdmin, async (req, res) => {
  try {
    res.json({ ok: true, data: await repository.tiempoEsperaPorEspecialidad() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/cancelaciones', ...onlyAdmin, async (req, res) => {
  try {
    res.json({ ok: true, data: await repository.tasaCancelaciones() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/reasignaciones/efectividad', ...onlyAdmin, async (req, res) => {
  try {
    res.json({ ok: true, data: await repository.efectividadReasignaciones() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/disponibilidad', ...onlyAdmin, async (req, res) => {
  try {
    res.json({ ok: true, data: await repository.disponibilidadHoras() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
