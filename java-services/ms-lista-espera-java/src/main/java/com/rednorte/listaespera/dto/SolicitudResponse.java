package com.rednorte.listaespera.dto;

import com.rednorte.listaespera.domain.EstadoSolicitud;
import com.rednorte.listaespera.domain.Prioridad;
import com.rednorte.listaespera.domain.Solicitud;
import com.rednorte.listaespera.domain.TipoSolicitud;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO de respuesta para una solicitud de lista de espera.
 * Se construye desde la entidad {@link Solicitud} mediante {@link #from(Solicitud)}.
 */
@Data
@Builder
public class SolicitudResponse {

    private UUID id;
    private String pacienteId;
    private String rutPaciente;
    private String nombrePaciente;
    private TipoSolicitud tipo;
    private String especialidad;
    private Prioridad prioridad;
    private EstadoSolicitud estado;
    private String descripcion;
    private String hospitalOrigen;
    private Instant fechaIngreso;
    private Instant fechaAsignacion;

    /** Mapea una entidad Solicitud a su DTO de respuesta. */
    public static SolicitudResponse from(Solicitud s) {
        return SolicitudResponse.builder()
                .id(s.getId())
                .pacienteId(s.getPacienteId())
                .rutPaciente(s.getRutPaciente())
                .nombrePaciente(s.getNombrePaciente())
                .tipo(s.getTipo())
                .especialidad(s.getEspecialidad())
                .prioridad(s.getPrioridad())
                .estado(s.getEstado())
                .descripcion(s.getDescripcion())
                .hospitalOrigen(s.getHospitalOrigen())
                .fechaIngreso(s.getFechaIngreso())
                .fechaAsignacion(s.getFechaAsignacion())
                .build();
    }
}
