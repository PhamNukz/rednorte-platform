/**
 * ms-reportes usa CQRS puro de lectura.
 * Accede a las BDs de cada microservicio en modo read-only
 * mediante conexiones separadas (principio de mínimo privilegio).
 */
const { Pool } = require('pg');

const pools = {
  espera: new Pool({ connectionString: process.env.DB_ESPERA_URL, max: 5 }),
  reasig: new Pool({ connectionString: process.env.DB_REASIG_URL, max: 5 }),
  pacientes: new Pool({ connectionString: process.env.DB_PACIENTES_URL, max: 5 }),
  dispon: new Pool({ connectionString: process.env.DB_DISPON_URL, max: 5 }),
};

Object.entries(pools).forEach(([name, pool]) => {
  pool.on('error', (err) => console.error(`[DB-Reportes:${name}] Error:`, err.message));
});

module.exports = pools;
