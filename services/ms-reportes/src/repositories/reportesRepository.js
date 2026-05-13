/**
 * CQRS — Solo operaciones de lectura, con datos anonimizados.
 * Nunca expone datos personales identificables.
 */
const pools = require('../config/databases');

const reportesRepository = {
  // Indicador: distribución de solicitudes por estado
  async solicitudesPorEstado() {
    const { rows } = await pools.espera.query(
      `SELECT estado, COUNT(*) AS total,
              ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - fecha_ingreso))/3600)::numeric, 2) AS promedio_horas_espera
       FROM solicitudes GROUP BY estado ORDER BY estado`
    );
    return rows;
  },

  // Indicador: tiempos de espera por especialidad
  async tiempoEsperaPorEspecialidad() {
    const { rows } = await pools.espera.query(
      `SELECT especialidad,
              COUNT(*) AS total_solicitudes,
              COUNT(*) FILTER (WHERE estado = 'asignada') AS asignadas,
              COUNT(*) FILTER (WHERE estado = 'pendiente' OR estado = 'en_espera') AS en_espera,
              ROUND(AVG(
                CASE WHEN fecha_asignacion IS NOT NULL
                     THEN EXTRACT(EPOCH FROM (fecha_asignacion - fecha_ingreso))/86400
                     ELSE NULL END
              )::numeric, 2) AS promedio_dias_hasta_asignacion
       FROM solicitudes
       GROUP BY especialidad
       ORDER BY total_solicitudes DESC`
    );
    return rows;
  },

  // Indicador: tasa de cancelaciones (últimos 30 días)
  async tasaCancelaciones() {
    const { rows } = await pools.espera.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE estado = 'cancelada') AS canceladas,
         ROUND(
           (COUNT(*) FILTER (WHERE estado = 'cancelada')::numeric / NULLIF(COUNT(*),0)) * 100, 2
         ) AS tasa_cancelacion_pct
       FROM solicitudes
       WHERE fecha_ingreso >= NOW() - INTERVAL '30 days'`
    );
    return rows[0];
  },

  // Indicador: reasignaciones exitosas vs fallidas
  async efectividadReasignaciones() {
    const { rows } = await pools.reasig.query(
      `SELECT estado, COUNT(*) AS total,
              especialidad
       FROM reasignaciones
       WHERE fecha_procesado >= NOW() - INTERVAL '30 days'
       GROUP BY estado, especialidad
       ORDER BY especialidad, estado`
    );
    return rows;
  },

  // Indicador: horas médicas disponibles por especialidad
  async disponibilidadHoras() {
    const { rows } = await pools.dispon.query(
      `SELECT especialidad,
              COUNT(*) FILTER (WHERE estado = 'disponible') AS disponibles,
              COUNT(*) FILTER (WHERE estado = 'reservada') AS reservadas,
              COUNT(*) AS total
       FROM horas_medicas
       WHERE fecha_hora >= NOW()
       GROUP BY especialidad
       ORDER BY especialidad`
    );
    return rows;
  },

  // Dashboard resumen ejecutivo
  async dashboardResumen() {
    const [estados, cancelaciones, disponibilidad] = await Promise.all([
      reportesRepository.solicitudesPorEstado(),
      reportesRepository.tasaCancelaciones(),
      reportesRepository.disponibilidadHoras(),
    ]);
    return {
      solicitudes_por_estado: estados,
      cancelaciones_30d: cancelaciones,
      disponibilidad_horas: disponibilidad,
      generado_en: new Date().toISOString(),
    };
  },
};

module.exports = reportesRepository;
