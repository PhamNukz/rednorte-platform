const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rednorte_jwt_secret_2025';

/**
 * Verifica el token JWT y agrega req.user con { id, rut, rol }.
 * Roles válidos: 'paciente' | 'medico' | 'admin'
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

/**
 * Genera un access token (15 min) y un refresh token (7 días).
 */
function generateTokens(payload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

/**
 * Middleware de autorización por rol.
 * @param {...string} roles - Roles permitidos
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
}

/**
 * Genera un JWT de larga duración para llamadas internas entre microservicios.
 * El token lleva rol 'admin' para que pase los requireRole de todos los servicios.
 */
// UUID fijo para llamadas de sistema — compatible con columnas cambiado_por UUID en BD
const SYSTEM_UUID = '00000000-0000-0000-0000-000000000001';

function generateServiceToken(serviceName = 'internal') {
  return jwt.sign(
    { id: SYSTEM_UUID, service: serviceName, rol: 'admin', type: 'service' },
    JWT_SECRET,
    { expiresIn: '365d' }
  );
}

module.exports = { verifyToken, generateTokens, requireRole, generateServiceToken };
