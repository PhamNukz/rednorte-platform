package com.rednorte.agenda.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

/** DTO para crear una nueva hora disponible en la agenda. */
@Data
public class CrearHoraRequest {

    @NotNull(message = "El ID del médico es obligatorio")
    private UUID medicoId;

    @NotNull(message = "La fecha y hora es obligatoria")
    private Instant fechaHora;

    @Min(value = 15, message = "La duración mínima es 15 minutos")
    private int duracionMin = 30;

    private String observaciones;
}
