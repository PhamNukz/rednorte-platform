package com.rednorte.bff.service;

import com.rednorte.bff.config.ServicesProperties;
import com.rednorte.bff.dto.SolicitudDTO;
import com.rednorte.bff.exception.ServiceUnavailableException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Cliente HTTP para ms-lista-espera (Node.js :3001).
 *
 * <p>Aplica Circuit Breaker "listaEspera" configurado en application.yml.
 * Si el circuito está ABIERTO, retorna fallback en vez de propagar el error.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ListaEsperaClientService {

    private final WebClient.Builder webClientBuilder;
    private final ServicesProperties props;

    @CircuitBreaker(name = "listaEspera", fallbackMethod = "fallbackSolicitudes")
    public List<SolicitudDTO> getSolicitudes(String estado, String especialidad) {
        log.debug("[BFF→ms-lista-espera] GET /solicitudes estado={} especialidad={}", estado, especialidad);
        String url = props.getListaEspera().getUrl() + "/solicitudes";

        return webClientBuilder.baseUrl(url).build()
                .get()
                .uri(u -> u.queryParamIfPresent("estado",
                        java.util.Optional.ofNullable(estado))
                     .queryParamIfPresent("especialidad",
                        java.util.Optional.ofNullable(especialidad))
                     .build())
                .retrieve()
                .bodyToMono(Map.class)
                .map(body -> {
                    Object data = body.get("data");
                    if (data instanceof List<?> list) {
                        return list.stream()
                                .map(item -> mapToDTO((Map<?, ?>) item))
                                .toList();
                    }
                    return List.<SolicitudDTO>of();
                })
                .block();
    }

    @CircuitBreaker(name = "listaEspera", fallbackMethod = "fallbackResumen")
    public Map<?, ?> getResumen() {
        return webClientBuilder
                .baseUrl(props.getListaEspera().getUrl())
                .build()
                .get()
                .uri("/solicitudes/resumen")
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    // ── Fallbacks ──────────────────────────────────────────────────────────

    public List<SolicitudDTO> fallbackSolicitudes(String estado, String especialidad, Exception ex) {
        log.warn("[BFF] Circuit Breaker ABIERTO para ms-lista-espera: {}", ex.getMessage());
        return List.of(); // Retorna lista vacía en vez de propagar error
    }

    public Map<?, ?> fallbackResumen(Exception ex) {
        log.warn("[BFF] Fallback resumen lista-espera: {}", ex.getMessage());
        return Map.of("error", "servicio no disponible");
    }

    private SolicitudDTO mapToDTO(Map<?, ?> map) {
        SolicitudDTO dto = new SolicitudDTO();
        dto.setId(str(map, "id"));
        dto.setNombrePaciente(str(map, "nombre_paciente"));
        dto.setEspecialidad(str(map, "especialidad"));
        dto.setPrioridad(str(map, "prioridad"));
        dto.setEstado(str(map, "estado"));
        dto.setTipo(str(map, "tipo"));
        dto.setHospitalOrigen(str(map, "hospital_origen"));
        return dto;
    }

    private String str(Map<?, ?> map, String key) {
        Object v = map.get(key);
        return v != null ? v.toString() : null;
    }
}
