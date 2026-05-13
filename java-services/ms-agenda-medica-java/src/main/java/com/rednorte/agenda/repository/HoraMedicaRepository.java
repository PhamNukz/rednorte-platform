package com.rednorte.agenda.repository;

import com.rednorte.agenda.domain.EstadoHora;
import com.rednorte.agenda.domain.HoraMedica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Repositorio Spring Data JPA para {@link HoraMedica}.
 * Patrón Repository — abstrae las consultas de agenda médica.
 */
@Repository
public interface HoraMedicaRepository extends JpaRepository<HoraMedica, UUID> {

    /** Horas disponibles a partir de ahora, ordenadas por fecha. */
    @Query("""
            SELECT h FROM HoraMedica h JOIN FETCH h.medico m
            WHERE h.estado = :estado
              AND h.fechaHora > :desde
              AND (:especialidad IS NULL OR m.especialidad = :especialidad)
            ORDER BY h.fechaHora ASC
            """)
    List<HoraMedica> findDisponibles(
            @Param("estado") EstadoHora estado,
            @Param("desde") Instant desde,
            @Param("especialidad") String especialidad);

    /** Horas de un médico específico en un rango de fechas. */
    @Query("""
            SELECT h FROM HoraMedica h
            WHERE h.medico.id = :medicoId
              AND h.fechaHora BETWEEN :inicio AND :fin
            ORDER BY h.fechaHora ASC
            """)
    List<HoraMedica> findByMedicoYRango(
            @Param("medicoId") UUID medicoId,
            @Param("inicio") Instant inicio,
            @Param("fin") Instant fin);

    /** Horas reservadas para una solicitud específica. */
    List<HoraMedica> findBySolicitudId(UUID solicitudId);

    /** Cuenta de horas disponibles por especialidad. */
    @Query("""
            SELECT m.especialidad, COUNT(h)
            FROM HoraMedica h JOIN h.medico m
            WHERE h.estado = 'DISPONIBLE'
            GROUP BY m.especialidad
            """)
    List<Object[]> countDisponiblesByEspecialidad();
}
