const router = require('express').Router();
const repository = require('../repositories/pacientesRepository');
const { verifyToken, requireRole } = require('../../../../shared/middleware/auth');

// Registrar paciente
router.post('/', verifyToken, requireRole('admin', 'medico'), async (req, res) => {
  try {
    const paciente = await repository.create(req.body);
    res.status(201).json({ ok: true, data: paciente });
  } catch (err) {
    const status = err.message.includes('unique') ? 409 : 500;
    res.status(status).json({ ok: false, error: err.message });
  }
});

// Obtener perfil propio o por admin
router.get('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.rol === 'paciente' && req.user.paciente_id !== req.params.id) {
      return res.status(403).json({ ok: false, error: 'Acceso denegado' });
    }
    const paciente = await repository.findById(req.params.id);
    if (!paciente) return res.status(404).json({ ok: false, error: 'No encontrado' });
    res.json({ ok: true, data: paciente });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Buscar por RUT
router.get('/rut/:rut', verifyToken, requireRole('medico', 'admin'), async (req, res) => {
  try {
    const paciente = await repository.findByRut(req.params.rut);
    if (!paciente) return res.status(404).json({ ok: false, error: 'No encontrado' });
    res.json({ ok: true, data: paciente });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Actualizar datos de contacto
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.rol === 'paciente' && req.user.paciente_id !== req.params.id) {
      return res.status(403).json({ ok: false, error: 'Acceso denegado' });
    }
    const campos_permitidos = ['email', 'telefono', 'direccion', 'consentimiento_datos'];
    const data = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => campos_permitidos.includes(k))
    );
    const actualizado = await repository.update(req.params.id, data);
    res.json({ ok: true, data: actualizado });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Historial de citas
router.get('/:id/historial', verifyToken, async (req, res) => {
  try {
    if (req.user.rol === 'paciente' && req.user.paciente_id !== req.params.id) {
      return res.status(403).json({ ok: false, error: 'Acceso denegado' });
    }
    const data = await repository.getHistorialCitas(req.params.id);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Notificaciones del paciente
router.get('/:id/notificaciones', verifyToken, async (req, res) => {
  try {
    const data = await repository.getNotificaciones(req.params.id);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
