package com.rednorte.listaespera.service;

import com.rednorte.listaespera.domain.EstadoSolicitud;
import com.rednorte.listaespera.domain.Solicitud;
import com.rednorte.listaespera.dto.ActualizarEstadoRequest;
import com.rednorte.listaespera.dto.CrearSolicitudRequest;
import com.rednorte.listaespera.dto.SolicitudResponse;
import com.rednorte.listaespera.factory.SolicitudFactory;
import com.rednorte.listaespera.repository.SolicitudRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio de negocio para gestión de solicitudes de lista de espera.
 *
 * <p>Delega la creación al {@link SolicitudFactory} (Factory Method pattern)
 * y persiste mediante {@link SolicitudRepository} (Repository pattern).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SolicitudService {

    private final SolicitudRepository repository;

    // ── Comandos (escritura) ───────────────────────────────────────────────

    /**
     * Crea una nueva solicitud usando el Factory Method para determinar
     * prioridad y estado inicial según el tipo clínico.
     */
    @Transactional
    public SolicitudResponse crear(CrearSolicitudRequest request) {
        log.info("[ms-lista-espera] Creando solicitud tipo={} paciente={}",
                request.getTipo(), request.getRutPaciente());

        Solicitud solicitud = SolicitudFactory.crear(request);
        Solicitud guardada = repository.save(solicitud);

        log.info("[ms-lista-espera] Solicitud creada id={} estado={}", guardada.getId(), guardada.getEstado());
        return SolicitudResponse.from(guardada);
    }

    /**
     * Actualiza el estado de una solicitud con registro del cambio.
     */
    @Transactional
    public SolicitudResponse actualizarEstado(UUID id, ActualizarEstadoRequest request) {
        Solicitud solicitud = findOrThrow(id);
        EstadoSolicitud anterior = solicitud.getEstado();

        solicitud.setEstado(request.getEstado());

        if (request.getEstado() == EstadoSolicitud.ASIGNADA) {
            solicitud.setFechaAsignacion(Instant.now());
        }

        Solicitud actualizada = repository.save(solicitud);
        log.info("[ms-lista-espera] Estado actualizado id={} {} → {}",
                id, anterior, request.getEstado());

        return SolicitudResponse.from(actualizada);
    }

    // ── Consultas (lectura) ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public SolicitudResponse findById(UUID id) {
        return SolicitudResponse.from(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<SolicitudResponse> findAll(String estadoStr, String especialidad) {
        EstadoSolicitud estado = parseEstado(estadoStr);

        List<Solicitud> solicitudes;
        if (estado != null && especialidad != null) {
            solicitudes = repository.findByEstadoAndEspecialidadOrderByPrioridadDesc(estado, especialidad);
        } else if (estado != null) {
            solicitudes = repository.findByEstadoOrderByFechaIngresoAsc(estado);
        } else if (especialidad != null) {
            solicitudes = repository.findByEspecialidadOrderByPrioridadDescFechaIngresoAsc(especialidad);
        } else {
            solicitudes = repository.findAll();
        }

        return solicitudes.stream().map(SolicitudResponse::from).toList();
    }

    /**
     * Resumen estadístico por estado, para el dashboard del BFF.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getResumen() {
        long pendientes  = repository.countByEstado(EstadoSolicitud.PENDIENTE);
        long enEspera    = repository.countByEstado(EstadoSolicitud.EN_ESPERA);
        long asignadas   = repository.countByEstado(EstadoSolicitud.ASIGNADA);
        long canceladas  = repository.countByEstado(EstadoSolicitud.CANCELADA);
        long completadas = repository.countByEstado(EstadoSolicitud.COMPLETADA);
        long total       = pendientes + enEspera + asignadas + canceladas + completadas;

        // Agrupación por especialidad
        Map<String, Long> porEspecialidad = repository.countByEspecialidad()
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        return Map.of(
                "total",           total,
                "pendientes",      pendientes,
                "en_espera",       enEspera,
                "asignadas",       asignadas,
                "canceladas",      canceladas,
                "completadas",     completadas,
                "por_especialidad", porEspecialidad
        );
    }

    /**
     * Obtiene la siguiente solicitud elegible para reasignación
     * (la más urgente en estado EN_ESPERA).
     */
    @Transactional(readOnly = true)
    public SolicitudResponse getSiguienteElegible(String especialidad) {
        List<Solicitud> elegibles = repository.findElegibles(
                EstadoSolicitud.EN_ESPERA,
                especialidad,
                PageRequest.of(0, 1));

        if (elegibles.isEmpty()) {
            throw new NoSuchElementException("No hay solicitudes elegibles" +
                    (especialidad != null ? " para " + especialidad : ""));
        }
        return SolicitudResponse.from(elegibles.get(0));
    }

    // ── helpers ───────────────────────────────────────────────────────────

    private Solicitud findOrThrow(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Solicitud no encontrada: " + id));
    }

    private EstadoSolicitud parseEstado(String estadoStr) {
        if (estadoStr == null || estadoStr.isBlank()) return null;
        try {
            return EstadoSolicitud.valueOf(estadoStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
