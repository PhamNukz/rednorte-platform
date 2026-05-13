package com.rednorte.bff.controller;

import com.rednorte.bff.dto.DashboardDTO;
import com.rednorte.bff.dto.SolicitudDTO;
import com.rednorte.bff.service.AgregadorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controlador REST del BFF (Backend For Frontend).
 *
 * <p>Expone endpoints optimizados para el portal React de RedNorte,
 * agregando datos de múltiples microservicios en una sola respuesta.
 * Patrón BFF + Facade.
 */
@RestController
@RequestMapping("/api/bff")
@RequiredArgsConstructor
@Tag(name = "BFF Agregador", description = "Endpoints agregados para el portal React RedNorte")
public class AgregadorController {

    private final AgregadorService agregadorService;

    /**
     * Dashboard principal del portal: combina resumen de lista de espera
     * + próximas horas disponibles en una sola respuesta.
     */
    @GetMapping("/dashboard")
    @Operation(
        summary = "Dashboard agregado",
        description = "Retorna resumen de solicitudes + próximas horas disponibles (Facade pattern)"
    )
    public ResponseEntity<DashboardDTO> getDashboard(
            @Parameter(description = "Filtrar por especialidad médica")
            @RequestParam(required = false) String especialidad) {

        DashboardDTO dashboard = agregadorService.getDashboard(especialidad);
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Lista de solicitudes priorizadas para vista de médico/gestor.
     * Devuelve solicitudes en estado "en_espera" ordenadas por prioridad.
     */
    @GetMapping("/solicitudes/priorizadas")
    @Operation(
        summary = "Solicitudes priorizadas",
        description = "Solicitudes en espera ordenadas URGENTE→ALTA→MEDIA→BAJA"
    )
    public ResponseEntity<List<SolicitudDTO>> getSolicitudesPriorizadas(
            @RequestParam(required = false) String especialidad) {

        List<SolicitudDTO> solicitudes = agregadorService.getSolicitudesPriorizadas(especialidad);
        return ResponseEntity.ok(solicitudes);
    }

    /** Health check del BFF. */
    @GetMapping("/health")
    @Operation(summary = "Health check del BFF")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("BFF RedNorte OK");
    }
}
