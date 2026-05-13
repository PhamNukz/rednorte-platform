const router = require('express').Router();
const repository = require('../repositories/reasignacionRepository');
const { verifyToken, requireRole } = require('../../../../shared/middleware/auth');

router.get('/paciente/:paciente_id', verifyToken, async (req, res) => {
  try {
    const data = await repository.findByPaciente(req.params.paciente_id);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/solicitud/:solicitud_id', verifyToken, requireRole('medico', 'admin'), async (req, res) => {
  try {
    const data = await repository.findBySolicitud(req.params.solicitud_id);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
