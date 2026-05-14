const pool = require('../config/database');

class PacientesRepository {
  async create(data) {
    const { rut, nombre, apellido, fecha_nacimiento, email, telefono, direccion } = data;
    const { rows } = await pool.query(
      `INSERT INTO pacientes (rut, nombre, apellido, fecha_nacimiento, email, telefono, direccion)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [rut, nombre, apellido, fecha_nacimiento, email, telefono, direccion]
    );
    return rows[0];
  }

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM pacientes WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async findByRut(rut) {
    const { rows } = await pool.query('SELECT * FROM pacientes WHERE rut = $1', [rut]);
    return rows[0] || null;
  }

  async update(id, data) {
    const fields = Object.keys(data).filter(k => k !== 'id');
    if (!fields.length) throw new Error('Sin campos para actualizar');
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = [id, ...fields.map(f => data[f])];
    const { rows } = await pool.query(
      `UPDATE pacientes SET ${setClause}, actualizado_en = NOW() WHERE id = $1 RETURNING *`, values
    );
    return rows[0];
  }

  async getHistorialCitas(paciente_id) {
    const { rows } = await pool.query(
      'SELECT * FROM historial_citas WHERE paciente_id = $1 ORDER BY registrado_en DESC',
      [paciente_id]
    );
    return rows;
  }

  async registrarCitaEnHistorial(data) {
    const { paciente_id, solicitud_id, especialidad, medico_nombre, hospital, fecha_cita, estado } = data;
    const { rows } = await pool.query(
      `INSERT INTO historial_citas
         (paciente_id, solicitud_id, especialidad, medico_nombre, hospital, fecha_cita, estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [paciente_id, solicitud_id, especialidad, medico_nombre, hospital, fecha_cita, estado]
    );
    return rows[0];
  }

  async getNotificaciones(paciente_id) {
    const { rows } = await pool.query(
      'SELECT * FROM notificaciones_paciente WHERE paciente_id = $1 ORDER BY creada_en DESC LIMIT 50',
      [paciente_id]
    );
    return rows;
  }

  async createNotificacion(data) {
    const { paciente_id, tipo, mensaje, canal } = data;
    const { rows } = await pool.query(
      `INSERT INTO notificaciones_paciente (paciente_id, tipo, mensaje, canal)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [paciente_id, tipo, mensaje, canal]
    );
    return rows[0];
  }

  async marcarNotificacionEnviada(id) {
    await pool.query(
      "UPDATE notificaciones_paciente SET estado = 'enviada', enviada_en = NOW() WHERE id = $1",
      [id]
    );
  }
}

module.exports = new PacientesRepository();
