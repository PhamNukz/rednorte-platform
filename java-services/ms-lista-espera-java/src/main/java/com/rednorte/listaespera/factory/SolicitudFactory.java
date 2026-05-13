package com.rednorte.listaespera.factory;

import com.rednorte.listaespera.domain.EstadoSolicitud;
import com.rednorte.listaespera.domain.Prioridad;
import com.rednorte.listaespera.domain.Solicitud;
import com.rednorte.listaespera.domain.TipoSolicitud;
import com.rednorte.listaespera.dto.CrearSolicitudRequest;

/**
 * Patrón Factory Method — crea instancias de {@link Solicitud} con valores
 * predeterminados según el tipo clínico, evitando lógica dispersa en el
 * Service o Controller.
 *
 * <p>Cada tipo de solicitud tiene reglas de negocio propias:
 * <ul>
 *   <li><b>URGENCIA</b>: prioridad URGENTE por defecto, estado EN_ESPERA inmediato</li>
 *   <li><b>PROGRAMADA</b>: prioridad MEDIA, estado PENDIENTE</li>
 *   <li><b>PROCEDIMIENTO</b>: prioridad ALTA, estado PENDIENTE</li>
 *   <li><b>QUIRURGICA</b>: prioridad ALTA, estado PENDIENTE</li>
 * </ul>
 */
public final class SolicitudFactory {

    private SolicitudFactory() {}

    /**
     * Crea una {@link Solicitud} según el tipo indicado en el request.
     *
     * @param request DTO con datos del paciente y tipo de solicitud
     * @return entidad Solicitud lista para persistir
     * @throws IllegalArgumentException si el tipo no es reconocido
     */
    public static Solicitud crear(CrearSolicitudRequest request) {
        return switch (request.getTipo()) {
            case URGENCIA     -> crearUrgencia(request);
            case PROGRAMADA   -> crearProgramada(request);
            case PROCEDIMIENTO -> crearProcedimiento(request);
            case QUIRURGICA   -> crearQuirurgica(request);
        };
    }

    // ── Métodos Factory por tipo ──────────────────────────────────────────

    private static Solicitud crearUrgencia(CrearSolicitudRequest req) {
        return baseBuilder(req)
                .tipo(TipoSolicitud.URGENCIA)
                .prioridad(req.getPrioridad() != null ? req.getPrioridad() : Prioridad.URGENTE)
                .estado(EstadoSolicitud.EN_ESPERA) // urgencia entra directamente en espera
                .build();
    }

    private static Solicitud crearProgramada(CrearSolicitudRequest req) {
        return baseBuilder(req)
                .tipo(TipoSolicitud.PROGRAMADA)
                .prioridad(req.getPrioridad() != null ? req.getPrioridad() : Prioridad.MEDIA)
                .estado(EstadoSolicitud.PENDIENTE)
                .build();
    }

    private static Solicitud crearProcedimiento(CrearSolicitudRequest req) {
        return baseBuilder(req)
                .tipo(TipoSolicitud.PROCEDIMIENTO)
                .prioridad(req.getPrioridad() != null ? req.getPrioridad() : Prioridad.ALTA)
                .estado(EstadoSolicitud.PENDIENTE)
                .build();
    }

    private static Solicitud crearQuirurgica(CrearSolicitudRequest req) {
        return baseBuilder(req)
                .tipo(TipoSolicitud.QUIRURGICA)
                .prioridad(req.getPrioridad() != null ? req.getPrioridad() : Prioridad.ALTA)
                .estado(EstadoSolicitud.PENDIENTE)
                .build();
    }

    private static Solicitud.SolicitudBuilder baseBuilder(CrearSolicitudRequest req) {
        return Solicitud.builder()
                .pacienteId(req.getPacienteId())
                .rutPaciente(req.getRutPaciente())
                .nombrePaciente(req.getNombrePaciente())
                .especialidad(req.getEspecialidad())
                .descripcion(req.getDescripcion())
                .hospitalOrigen(req.getHospitalOrigen());
    }
}
