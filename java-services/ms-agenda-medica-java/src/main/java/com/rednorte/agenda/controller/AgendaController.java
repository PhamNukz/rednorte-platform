package com.rednorte.agenda.controller;

import com.rednorte.agenda.dto.CrearHoraRequest;
import com.rednorte.agenda.dto.HoraMedicaResponse;
import com.rednorte.agenda.dto.ReservarHoraRequest;
import com.rednorte.agenda.service.AgendaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controlador REST — Agenda Médica.
 * Base URL: /horas
 */
@RestController
@RequestMapping("/horas")
@RequiredArgsConstructor
@Tag(name = "Agenda Médica", description = "Gestión de horas médicas disponibles y reservas")
public class AgendaController {

    private final AgendaService agendaService;

    @GetMapping
    @Operation(summary = "Listar horas disponibles", description = "Filtro opcional por especialidad")
    public ResponseEntity<List<HoraMedicaResponse>> listarDisponibles(
            @RequestParam(required = false) String especialidad) {
        return ResponseEntity.ok(agendaService.getHorasDisponibles(especialidad));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener hora por ID")
    public ResponseEntity<HoraMedicaResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(agendaService.findById(id));
    }

    @GetMapping("/solicitud/{solicitudId}")
    @Operation(summary = "Horas asociadas a una solicitud de lista de espera")
    public ResponseEntity<List<HoraMedicaResponse>> porSolicitud(@PathVariable UUID solicitudId) {
        return ResponseEntity.ok(agendaService.getHorasBySolicitud(solicitudId));
    }

    @PostMapping
    @Operation(summary = "Crear hora disponible en la agenda")
    public ResponseEntity<HoraMedicaResponse> crear(
            @Valid @RequestBody CrearHoraRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(agendaService.crear(request));
    }

    @PostMapping("/reservar")
    @Operation(summary = "Reservar hora para un paciente (atómico)")
    public ResponseEntity<HoraMedicaResponse> reservar(
            @Valid @RequestBody ReservarHoraRequest request) {
        return ResponseEntity.ok(agendaService.reservar(request));
    }

    @PatchMapping("/{id}/liberar")
    @Operation(summary = "Liberar una hora reservada")
    public ResponseEntity<HoraMedicaResponse> liberar(
            @PathVariable UUID id,
            @RequestParam(required = false) String motivo) {
        return ResponseEntity.ok(agendaService.liberar(id, motivo));
    }

    @PatchMapping("/{id}/completar")
    @Operation(summary = "Marcar una hora como completada")
    public ResponseEntity<HoraMedicaResponse> completar(@PathVariable UUID id) {
        return ResponseEntity.ok(agendaService.completar(id));
    }
}
