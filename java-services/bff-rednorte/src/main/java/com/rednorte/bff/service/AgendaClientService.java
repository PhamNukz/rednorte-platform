package com.rednorte.bff.service;

import com.rednorte.bff.config.ServicesProperties;
import com.rednorte.bff.dto.HoraDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

/**
 * Cliente HTTP para ms-agenda-medica (Node.js :3004).
 *
 * <p>Aplica Circuit Breaker "agendaMedica" con fallback a lista vacía.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgendaClientService {

    private final WebClient.Builder webClientBuilder;
    private final ServicesProperties props;

    @CircuitBreaker(name = "agendaMedica", fallbackMethod = "fallbackHoras")
    public List<HoraDTO> getProximasHoras(String especialidad, int limite) {
        log.debug("[BFF→ms-agenda-medica] GET /horas especialidad={} limite={}", especialidad, limite);
        String baseUrl = props.getAgendaMedica().getUrl();

        return webClientBuilder.baseUrl(baseUrl).build()
                .get()
                .uri(u -> u.path("/horas")
                        .queryParam("estado", "disponible")
                        .queryParamIfPresent("especialidad",
                                java.util.Optional.ofNullable(especialidad))
                        .queryParam("limit", limite)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .map(body -> {
                    Object data = body.get("data");
                    if (data instanceof List<?> list) {
                        return list.stream()
                                .map(item -> mapToHoraDTO((Map<?, ?>) item))
                                .toList();
                    }
                    return List.<HoraDTO>of();
                })
                .block();
    }

    // ── Fallback ───────────────────────────────────────────────────────────

    public List<HoraDTO> fallbackHoras(String especialidad, int limite, Exception ex) {
        log.warn("[BFF] Circuit Breaker ABIERTO para ms-agenda-medica: {}", ex.getMessage());
        return List.of();
    }

    private HoraDTO mapToHoraDTO(Map<?, ?> map) {
        HoraDTO dto = new HoraDTO();
        dto.setId(str(map, "id"));
        dto.setMedicoId(str(map, "medico_id"));
        dto.setNombreMedico(str(map, "nombre_medico"));
        dto.setEspecialidad(str(map, "especialidad"));
        dto.setHospital(str(map, "hospital"));
        dto.setEstado(str(map, "estado"));
        dto.setDuracionMin(parseIntOrNull(map.get("duracion_min")));

        String fechaStr = str(map, "fecha_hora");
        if (fechaStr != null) {
            try {
                dto.setFechaHora(java.time.Instant.parse(fechaStr));
            } catch (Exception ignored) {
                log.debug("No se pudo parsear fecha_hora: {}", fechaStr);
            }
        }
        return dto;
    }

    private String str(Map<?, ?> map, String key) {
        Object v = map.get(key);
        return v != null ? v.toString() : null;
    }

    private Integer parseIntOrNull(Object v) {
        if (v == null) return null;
        try { return Integer.parseInt(v.toString()); }
        catch (NumberFormatException e) { return null; }
    }
}
