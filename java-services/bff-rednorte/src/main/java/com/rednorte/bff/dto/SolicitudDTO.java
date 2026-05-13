package com.rednorte.bff.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.time.Instant;

/**
 * DTO que representa una solicitud de lista de espera
 * tal como viene del ms-lista-espera.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SolicitudDTO {
    private String id;
    private String pacienteId;
    private String rutPaciente;
    private String nombrePaciente;
    private String tipo;
    private String especialidad;
    private String prioridad;
    private String estado;
    private String descripcion;
    private String hospitalOrigen;
    private Instant fechaIngreso;
    private Instant fechaAsignacion;
}
