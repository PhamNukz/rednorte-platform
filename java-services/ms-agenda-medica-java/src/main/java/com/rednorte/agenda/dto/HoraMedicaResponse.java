package com.rednorte.agenda.dto;

import com.rednorte.agenda.domain.EstadoHora;
import com.rednorte.agenda.domain.HoraMedica;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

/** DTO de respuesta para una hora médica. */
@Data
@Builder
public class HoraMedicaResponse {
    private UUID id;
    private UUID medicoId;
    private String nombreMedico;
    private String especialidad;
    private String hospital;
    private Instant fechaHora;
    private int duracionMin;
    private EstadoHora estado;
    private UUID solicitudId;
    private String pacienteRut;
    private String pacienteNombre;

    public static HoraMedicaResponse from(HoraMedica h) {
        return HoraMedicaResponse.builder()
                .id(h.getId())
                .medicoId(h.getMedico().getId())
                .nombreMedico(h.getMedico().getNombre())
                .especialidad(h.getMedico().getEspecialidad())
                .hospital(h.getMedico().getHospital())
                .fechaHora(h.getFechaHora())
                .duracionMin(h.getDuracionMin())
                .estado(h.getEstado())
                .solicitudId(h.getSolicitudId())
                .pacienteRut(h.getPacienteRut())
                .pacienteNombre(h.getPacienteNombre())
                .build();
    }
}
