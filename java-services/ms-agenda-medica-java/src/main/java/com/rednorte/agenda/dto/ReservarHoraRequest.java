package com.rednorte.agenda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/** DTO para reservar una hora médica a un paciente. */
@Data
public class ReservarHoraRequest {

    @NotNull(message = "El ID de la hora es obligatorio")
    private UUID horaId;

    @NotBlank(message = "El RUT del paciente es obligatorio")
    private String pacienteRut;

    @NotBlank(message = "El nombre del paciente es obligatorio")
    private String pacienteNombre;

    /** ID de la solicitud de lista de espera (referencia cross-service). */
    private UUID solicitudId;

    private String observaciones;
}
