package com.rednorte.listaespera.repository;

import com.rednorte.listaespera.domain.EstadoSolicitud;
import com.rednorte.listaespera.domain.Prioridad;
import com.rednorte.listaespera.domain.Solicitud;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio Spring Data JPA para {@link Solicitud}.
 *
 * <p>Patrón Repository: abstrae el acceso a datos y centraliza
 * las consultas relacionadas con solicitudes de lista de espera.
 */
@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, UUID> {

    /** Busca solicitudes por estado (para filtrar en el portal). */
    List<Solicitud> findByEstadoOrderByFechaIngresoAsc(EstadoSolicitud estado);

    /** Busca solicitudes por especialidad médica. */
    List<Solicitud> findByEspecialidadOrderByPrioridadDescFechaIngresoAsc(String especialidad);

    /** Busca solicitudes por estado Y especialidad (filtro combinado del BFF). */
    List<Solicitud> findByEstadoAndEspecialidadOrderByPrioridadDesc(
            EstadoSolicitud estado, String especialidad);

    /** Cuenta solicitudes por estado (para el dashboard de resumen). */
    long countByEstado(EstadoSolicitud estado);

    /** Cuenta solicitudes por estado y especialidad. */
    long countByEstadoAndEspecialidad(EstadoSolicitud estado, String especialidad);

    /**
     * Obtiene la siguiente solicitud elegible para reasignación:
     * estado EN_ESPERA, ordenada por prioridad DESC y fecha_ingreso ASC.
     */
    @Query("""
            SELECT s FROM Solicitud s
            WHERE s.estado = :estado
              AND (:especialidad IS NULL OR s.especialidad = :especialidad)
            ORDER BY
              CASE s.prioridad
                WHEN com.rednorte.listaespera.domain.Prioridad.URGENTE THEN 1
                WHEN com.rednorte.listaespera.domain.Prioridad.ALTA    THEN 2
                WHEN com.rednorte.listaespera.domain.Prioridad.MEDIA   THEN 3
                WHEN com.rednorte.listaespera.domain.Prioridad.BAJA    THEN 4
              END ASC,
              s.fechaIngreso ASC
            """)
    List<Solicitud> findElegibles(
            @Param("estado") EstadoSolicitud estado,
            @Param("especialidad") String especialidad,
            Pageable pageable);

    /** Paginación general con filtros opcionales. */
    @Query("""
            SELECT s FROM Solicitud s
            WHERE (:estado IS NULL OR s.estado = :estado)
              AND (:especialidad IS NULL OR s.especialidad = :especialidad)
            ORDER BY s.fechaIngreso DESC
            """)
    Page<Solicitud> findAllFiltered(
            @Param("estado") EstadoSolicitud estado,
            @Param("especialidad") String especialidad,
            Pageable pageable);

    /** Resumen de conteo por especialidad. */
    @Query("""
            SELECT s.especialidad, COUNT(s)
            FROM Solicitud s
            GROUP BY s.especialidad
            ORDER BY COUNT(s) DESC
            """)
    List<Object[]> countByEspecialidad();
}
