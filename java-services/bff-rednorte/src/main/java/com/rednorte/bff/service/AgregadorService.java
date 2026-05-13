package com.rednorte.bff.service;

import com.rednorte.bff.dto.DashboardDTO;
import com.rednorte.bff.dto.HoraDTO;
import com.rednorte.bff.dto.SolicitudDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Patrón Facade: agrega datos de múltiples microservicios en una sola
 * respuesta optimizada para el frontend (BFF pattern).
 *
 * <p>El frontend realiza UNA sola llamada a /api/bff/dashboard en vez
 * de tres llamadas independientes a ms-lista-espera, ms-agenda-medica
 * y ms-reportes, reduciendo latencia y complejidad en el cliente.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgregadorService {

    private final ListaEsperaClientService listaEsperaClient;
    private final AgendaClientService agendaClient;

    /**
     * Construye el DTO de dashboard combinando:
     * <ol>
     *   <li>Resumen de solicitudes por estado desde ms-lista-espera</li>
     *   <li>Próximas horas disponibles desde ms-agenda-medica</li>
     * </ol>
     *
     * @param especialidad filtro opcional de especialidad
     * @return {@link DashboardDTO} agregado listo para el portal React
     */
    public DashboardDTO getDashboard(String especialidad) {
        log.info("[BFF] Construyendo dashboard agregado especialidad={}", especialidad);

        // Llamada paralela conceptual — en producción se puede usar
        // CompletableFuture o WebFlux Mono.zip para paralelismo real.
        List<SolicitudDTO> todasSolicitudes = listaEsperaClient.getSolicitudes(null, especialidad);
        List<HoraDTO> proximasHoras = agendaClient.getProximasHoras(especialidad, 5);

        DashboardDTO.ResumenSolicitudes resumen = buildResumen(todasSolicitudes);

        return DashboardDTO.builder()
                .solicitudes(resumen)
                .proximasHoras(proximasHoras)
                .generadoEn(Instant.now())
                .build();
    }

    /**
     * Agrega solicitudes de lista de espera para la vista del médico:
     * filtra por estado "en_espera" y devuelve las más urgentes primero.
     */
    public List<SolicitudDTO> getSolicitudesPriorizadas(String especialidad) {
        log.info("[BFF] Solicitudes priorizadas especialidad={}", especialidad);
        List<SolicitudDTO> solicitudes = listaEsperaClient.getSolicitudes("en_espera", especialidad);

        // Ordena: URGENTE → ALTA → MEDIA → BAJA
        return solicitudes.stream()
                .sorted((a, b) -> prioridadOrd(b.getPrioridad()) - prioridadOrd(a.getPrioridad()))
                .toList();
    }

    // ── helpers ────────────────────────────────────────────────────────────

    private DashboardDTO.ResumenSolicitudes buildResumen(List<SolicitudDTO> solicitudes) {
        long total       = solicitudes.size();
        long pendientes  = count(solicitudes, "pendiente");
        long enEspera    = count(solicitudes, "en_espera");
        long asignadas   = count(solicitudes, "asignada");
        long canceladas  = count(solicitudes, "cancelada");
        long completadas = count(solicitudes, "completada");

        Map<String, Long> porEspecialidad = solicitudes.stream()
                .filter(s -> s.getEspecialidad() != null)
                .collect(Collectors.groupingBy(SolicitudDTO::getEspecialidad, Collectors.counting()));

        return DashboardDTO.ResumenSolicitudes.builder()
                .total(total)
                .pendientes(pendientes)
                .enEspera(enEspera)
                .asignadas(asignadas)
                .canceladas(canceladas)
                .completadas(completadas)
                .porEspecialidad(porEspecialidad)
                .build();
    }

    private long count(List<SolicitudDTO> list, String estado) {
        return list.stream()
                .filter(s -> estado.equalsIgnoreCase(s.getEstado()))
                .count();
    }

    private int prioridadOrd(String prioridad) {
        if (prioridad == null) return 0;
        return switch (prioridad.toLowerCase()) {
            case "urgente" -> 4;
            case "alta"    -> 3;
            case "media"   -> 2;
            case "baja"    -> 1;
            default        -> 0;
        };
    }
}
