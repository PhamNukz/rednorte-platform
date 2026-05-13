package com.rednorte.listaespera.controller;

import com.rednorte.listaespera.dto.ActualizarEstadoRequest;
import com.rednorte.listaespera.dto.CrearSolicitudRequest;
import com.rednorte.listaespera.dto.SolicitudResponse;
import com.rednorte.listaespera.service.SolicitudService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controlador REST — Solicitudes de Lista de Espera.
 * Base URL: /solicitudes
 */
@RestController
@RequestMapping("/solicitudes")
@RequiredArgsConstructor
@Tag(name = "Solicitudes", description = "CRUD y consultas de solicitudes de lista de espera")
public class SolicitudController {

    private final SolicitudService solicitudService;

    /** Crear una nueva solicitud. El Factory determina prioridad/estado inicial. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear solicitud", description = "Usa Factory Method para asignar prioridad según tipo clínico")
    public ResponseEntity<SolicitudResponse> crear(
            @Valid @RequestBody CrearSolicitudRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(solicitudService.crear(request));
    }

    /** Listar solicitudes con filtros opcionales. */
    @GetMapping
    @Operation(summary = "Listar solicitudes", description = "Filtros opcionales: estado, especialidad")
    public ResponseEntity<List<SolicitudResponse>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String especialidad) {
        return ResponseEntity.ok(solicitudService.findAll(estado, especialidad));
    }

    /** Obtener una solicitud por ID. */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener solicitud por ID")
    public ResponseEntity<SolicitudResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(solicitudService.findById(id));
    }

    /** Actualizar el estado de una solicitud (flujo de workflow). */
    @PatchMapping("/{id}/estado")
    @Operation(summary = "Actualizar estado de solicitud")
    public ResponseEntity<SolicitudResponse> actualizarEstado(
            @PathVariable UUID id,
            @Valid @RequestBody ActualizarEstadoRequest request) {
        return ResponseEntity.ok(solicitudService.actualizarEstado(id, request));
    }

    /** Resumen estadístico (usado por BFF y dashboard). */
    @GetMapping("/resumen")
    @Operation(summary = "Resumen estadístico por estado y especialidad")
    public ResponseEntity<Map<String, Object>> resumen() {
        return ResponseEntity.ok(solicitudService.getResumen());
    }

    /** Siguiente paciente elegible para reasignación. */
    @GetMapping("/siguiente-elegible")
    @Operation(summary = "Siguiente solicitud elegible (más urgente en espera)")
    public ResponseEntity<SolicitudResponse> siguienteElegible(
            @RequestParam(required = false) String especialidad) {
        return ResponseEntity.ok(solicitudService.getSiguienteElegible(especialidad));
    }
}
