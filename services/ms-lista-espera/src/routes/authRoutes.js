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
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE rut = $1 AND activo = TRUE', [rut]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }
    const tokens = generateTokens({ id: user.id, rut: user.rut, rol: user.rol });
    res.json({ ok: true, ...tokens, id: user.id, rol: user.rol, nombre: user.nombre });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Verifica si un RUT tiene cuenta registrada (público, sin auth)
router.get('/check/:rut', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT nombre, rol FROM usuarios WHERE rut = $1 AND activo = TRUE',
      [req.params.rut]
    );
    if (rows.length === 0) return res.json({ ok: true, exists: false });
    res.json({ ok: true, exists: true, nombre: rows[0].nombre, rol: rows[0].rol });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Registra un nuevo paciente (público, solo para demo)
router.post('/register', async (req, res) => {
  try {
    const { rut, nombre, email, telefono, password } = req.body;
    if (!rut || !nombre || !password) {
      return res.status(400).json({ ok: false, error: 'RUT, nombre y contraseña son requeridos' });
    }
    const { rows: existing } = await pool.query(
      'SELECT id FROM usuarios WHERE rut = $1', [rut]
    );
    if (existing.length > 0) {
      return res.status(409).json({ ok: false, error: 'Este RUT ya tiene una cuenta registrada' });
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (rut, nombre, email, telefono, password_hash, rol)
       VALUES ($1, $2, $3, $4, $5, 'paciente')
       RETURNING id, rut, nombre, rol`,
      [rut, nombre, email || null, telefono || null, hash]
    );
    const tokens = generateTokens({ id: rows[0].id, rut: rows[0].rut, rol: rows[0].rol });
    res.status(201).json({ ok: true, ...tokens, nombre: rows[0].nombre, rol: rows[0].rol });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
