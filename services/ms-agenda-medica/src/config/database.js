const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'db_disponibilidad',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres123',
  max: 10,
});
pool.on('error', (err) => console.error('[DB-Disponibilidad] Pool error:', err.message));
module.exports = pool;
