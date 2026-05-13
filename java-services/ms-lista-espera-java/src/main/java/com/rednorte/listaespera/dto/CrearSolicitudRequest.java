package com.rednorte.listaespera.dto;

import com.rednorte.listaespera.domain.Prioridad;
import com.rednorte.listaespera.domain.TipoSolicitud;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO para la creación de una nueva solicitud de lista de espera.
 * Validado con Bean Validation antes de llegar al Service.
 */
@Data
public class CrearSolicitudRequest {

    private String pacienteId;

    @NotBlank(message = "El RUT del paciente es obligatorio")
    private String rutPaciente;

    @NotBlank(message = "El nombre del paciente es obligatorio")
    private String nombrePaciente;

    @NotNull(message = "El tipo de solicitud es obligatorio")
    private TipoSolicitud tipo;

    @NotBlank(message = "La especialidad es obligatoria")
    private String especialidad;

    /** Si no se especifica, el Factory asigna la prioridad por defecto del tipo. */
    private Prioridad prioridad;

    private String descripcion;
    private String hospitalOrigen;
}
