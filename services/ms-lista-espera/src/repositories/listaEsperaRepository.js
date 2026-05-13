/**
 * Repository Pattern — abstrae todo acceso a datos de ms-lista-espera.
 * La lógica de negocio no conoce detalles de PostgreSQL.
 */
const pool = require('../config/database');

class ListaEsperaRepository {
  async create(solicitud) {
    const { paciente_id, rut_paciente, nombre_paciente, tipo, especialidad,
            prioridad, descripcion, hospital_origen, creado_por } = solicitud;
    const query = `
      INSERT INTO solicitudes
        (paciente_id, rut_paciente, nombre_paciente, tipo, especialidad,
         prioridad, descripcion, hospital_origen, creado_por)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`;
    const { rows } = await pool.query(query, [
      paciente_id, rut_paciente, nombre_paciente, tipo, especialidad,
      prioridad || 'media', descripcion, hospital_origen, creado_por,
    ]);
    return rows[0];
  }

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM solicitudes WHERE id = $1', [id]
    );
    return rows[0] || null;
  }

  // CQRS — operación de sólo lectura: filtra por estado y/o especialidad
  async findAll({ estado, especialidad, prioridad, limit = 50, offset = 0 } = {}) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (estado) { conditions.push(`estado = $${idx++}`); values.push(estado); }
    if (especialidad) { conditions.push(`especialidad ILIKE $${idx++}`); values.push(`%${especialidad}%`); }
    if (prioridad) { conditions.push(`prioridad = $${idx++}`); values.push(prioridad); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT * FROM solicitudes ${where}
       ORDER BY
         CASE prioridad WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 ELSE 4 END,
         fecha_ingreso ASC
       LIMIT $${idx++} OFFSET $${idx}`,
      values
    );
    return rows;
  }

  async updateEstado(id, estadoNuevo, cambiado_por, comentario = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: [actual] } = await client.query(
        'SELECT estado FROM solicitudes WHERE id = $1', [id]
      );
      if (!actual) throw new Error('Solicitud no encontrada');

      const { rows: [updated] } = await client.query(
        `UPDATE solicitudes
         SET estado = $1, fecha_actualizacion = NOW(),
             fecha_asignacion = CASE WHEN $1 = 'asignada' THEN NOW() ELSE fecha_asignacion END
         WHERE id = $2 RETURNING *`,
        [estadoNuevo, id]
      );

      await client.query(
        `INSERT INTO historial_estados
           (solicitud_id, estado_anterior, estado_nuevo, comentario, cambiado_por)
         VALUES ($1,$2,$3,$4,$5)`,
        [id, actual.estado, estadoNuevo, comentario, cambiado_por]
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

  async assignHora(solicitudId, horaId, cambiado_por) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: [updated] } = await client.query(
        `UPDATE solicitudes
         SET hora_asignada_id = $1, estado = 'asignada',
             fecha_asignacion = NOW(), fecha_actualizacion = NOW()
         WHERE id = $2 RETURNING *`,
        [horaId, solicitudId]
      );
      await client.query(
        `INSERT INTO historial_estados
           (solicitud_id, estado_anterior, estado_nuevo, comentario, cambiado_por)
         VALUES ($1,'en_espera','asignada','Hora asignada automáticamente',$2)`,
        [solicitudId, cambiado_por]
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

  async getHistorial(solicitudId) {
    const { rows } = await pool.query(
      `SELECT * FROM historial_estados WHERE solicitud_id = $1 ORDER BY fecha_cambio DESC`,
      [solicitudId]
    );
    return rows;
  }

  // CQRS — lectura para reportes: siguiente elegible por especialidad
  async getSiguienteElegible(especialidad) {
    const { rows } = await pool.query(
      `SELECT * FROM solicitudes
       WHERE estado = 'en_espera' AND especialidad ILIKE $1
       ORDER BY
         CASE prioridad WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 ELSE 4 END,
         fecha_ingreso ASC
       LIMIT 1`,
      [`%${especialidad}%`]
    );
    return rows[0] || null;
  }

  async countByEstado() {
    const { rows } = await pool.query(
      `SELECT estado, COUNT(*) as total FROM solicitudes GROUP BY estado`
    );
    return rows;
  }
}

module.exports = new ListaEsperaRepository();
