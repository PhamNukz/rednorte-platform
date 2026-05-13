const pool = require('../config/database');

class ReasignacionRepository {
  async create(data) {
    const { solicitud_id, paciente_id, hora_anterior_id, hora_nueva_id, especialidad, motivo, fecha_evento } = data;
    const { rows } = await pool.query(
      `INSERT INTO reasignaciones
         (solicitud_id, paciente_id, hora_anterior_id, hora_nueva_id, especialidad, motivo, fecha_evento)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [solicitud_id, paciente_id, hora_anterior_id, hora_nueva_id, especialidad, motivo, fecha_evento]
    );
    return rows[0];
  }

  async updateEstado(id, estado) {
    const { rows } = await pool.query(
      'UPDATE reasignaciones SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    return rows[0];
  }

  async findByPaciente(paciente_id) {
    const { rows } = await pool.query(
      'SELECT * FROM reasignaciones WHERE paciente_id = $1 ORDER BY fecha_procesado DESC',
      [paciente_id]
    );
    return rows;
  }

  async findBySolicitud(solicitud_id) {
    const { rows } = await pool.query(
      'SELECT * FROM reasignaciones WHERE solicitud_id = $1 ORDER BY fecha_procesado DESC',
      [solicitud_id]
    );
    return rows;
  }
}

module.exports = new ReasignacionRepository();
