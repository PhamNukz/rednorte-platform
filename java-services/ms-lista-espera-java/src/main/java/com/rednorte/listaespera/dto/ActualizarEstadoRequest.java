package com.rednorte.listaespera.dto;

import com.rednorte.listaespera.domain.EstadoSolicitud;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** DTO para actualizar el estado de una solicitud. */
@Data
public class ActualizarEstadoRequest {

    @NotNull(message = "El nuevo estado es obligatorio")
    private EstadoSolicitud estado;

    private String motivo;
    private String usuarioId;
}
