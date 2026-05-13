const router = require('express').Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateTokens } = require('../../../../shared/middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { rut, password } = req.body;
    if (!rut || !password) {
      return res.status(400).json({ ok: false, error: 'RUT y contraseña requeridos' });
    }
    // Nota: la tabla usuarios vive aquí como punto de autenticación centralizado
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE rut = $1 AND activo = TRUE', [rut]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }
    const tokens = generateTokens({ id: user.id, rut: user.rut, rol: user.rol });
    res.json({ ok: true, ...tokens, rol: user.rol });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
