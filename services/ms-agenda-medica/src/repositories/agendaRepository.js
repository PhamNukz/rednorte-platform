const pool = require('../config/database');

class AgendaRepository {
  async findHorasDisponibles({ especialidad, fecha_desde, fecha_hasta, limit = 20 }) {
    const conditions = ["estado = 'disponible'"];
    const values = [];
    let idx = 1;

    if (especialidad) { conditions.push(`especialidad ILIKE $${idx++}`); values.push(`%${especialidad}%`); }
    if (fecha_desde)  { conditions.push(`fecha_hora >= $${idx++}`);       values.push(fecha_desde); }
    if (fecha_hasta)  { conditions.push(`fecha_hora <= $${idx++}`);       values.push(fecha_hasta); }

    values.push(limit);
    const { rows } = await pool.query(
      `SELECT hm.*, m.nombre as nombre_medico, m.hospital
       FROM horas_medicas hm
       JOIN medicos m ON hm.medico_id = m.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY fecha_hora ASC
       LIMIT $${idx}`,
      values
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT hm.*, m.nombre as nombre_medico FROM horas_medicas hm
       JOIN medicos m ON hm.medico_id = m.id WHERE hm.id = $1`, [id]
    );
    return rows[0] || null;
  }

  async reservar(id, { solicitud_id, paciente_id }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: [hora] } = await client.query(
        "SELECT estado FROM horas_medicas WHERE id = $1 FOR UPDATE", [id]
      );
      if (!hora) throw new Error('Hora no encontrada');
      if (hora.estado !== 'disponible') throw new Error('Hora no disponible');

      const { rows: [updated] } = await client.query(
        `UPDATE horas_medicas
         SET estado = 'reservada', solicitud_id = $1, paciente_id = $2, actualizado_en = NOW()
         WHERE id = $3 RETURNING *`,
        [solicitud_id, paciente_id, id]
      );
      await client.query('COMMIT');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async liberar(id) {
    const { rows } = await pool.query(
      `UPDATE horas_medicas
       SET estado = 'disponible', solicitud_id = NULL, paciente_id = NULL, actualizado_en = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return rows[0];
  }

  async createHora(data) {
    const { medico_id, especialidad, hospital, fecha_hora, duracion_min } = data;
    const { rows } = await pool.query(
      `INSERT INTO horas_medicas (medico_id, especialidad, hospital, fecha_hora, duracion_min)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [medico_id, especialidad, hospital, fecha_hora, duracion_min || 30]
    );
    return rows[0];
  }

  async findMedicos({ especialidad } = {}) {
    const where = especialidad ? "WHERE especialidad ILIKE $1 AND activo = TRUE" : "WHERE activo = TRUE";
    const values = especialidad ? [`%${especialidad}%`] : [];
    const { rows } = await pool.query(`SELECT * FROM medicos ${where} ORDER BY nombre`, values);
    return rows;
  }
}

module.exports = new AgendaRepository();
