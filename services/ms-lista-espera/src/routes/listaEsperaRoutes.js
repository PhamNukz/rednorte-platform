const router = require('express').Router();
const ctrl = require('../controllers/listaEsperaController');
const { verifyToken, requireRole } = require('../../../../shared/middleware/auth');

// Rutas públicas autenticadas
router.post('/', verifyToken, requireRole('medico', 'admin'), ctrl.registrar);
router.get('/', verifyToken, ctrl.listar);
router.get('/resumen', verifyToken, requireRole('medico', 'admin'), ctrl.resumen);
router.get('/:id', verifyToken, ctrl.obtener);
router.patch('/:id/estado', verifyToken, requireRole('medico', 'admin'), ctrl.actualizarEstado);
router.get('/:id/historial', verifyToken, ctrl.historial);

module.exports = router;
