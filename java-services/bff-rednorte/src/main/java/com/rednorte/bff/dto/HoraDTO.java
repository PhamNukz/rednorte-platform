package com.rednorte.bff.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.time.Instant;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class HoraDTO {
    private String id;
    private String medicoId;
    private String nombreMedico;
    private String especialidad;
    private String hospital;
    private Instant fechaHora;
    private Integer duracionMin;
    private String estado;
}
