package com.rednorte.bff.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * DTO agregado que el BFF construye combinando datos de
 * ms-lista-espera, ms-agenda-medica y ms-reportes.
 *
 * <p>Patrón Facade: el frontend recibe un único objeto en vez
 * de hacer tres llamadas separadas.
 */
@Data
@Builder
public class DashboardDTO {
    private ResumenSolicitudes solicitudes;
    private List<HoraDTO> proximasHoras;
    private Object indicadores;
    private Instant generadoEn;

    @Data
    @Builder
    public static class ResumenSolicitudes {
        private long total;
        private long pendientes;
        private long enEspera;
        private long asignadas;
        private long canceladas;
        private long completadas;
        private Map<String, Long> porEspecialidad;
    }
}
