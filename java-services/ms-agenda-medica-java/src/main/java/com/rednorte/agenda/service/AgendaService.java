package com.rednorte.agenda.service;

import com.rednorte.agenda.domain.EstadoHora;
import com.rednorte.agenda.domain.HoraMedica;
import com.rednorte.agenda.domain.Medico;
import com.rednorte.agenda.dto.CrearHoraRequest;
import com.rednorte.agenda.dto.HoraMedicaResponse;
import com.rednorte.agenda.dto.ReservarHoraRequest;
import com.rednorte.agenda.repository.HoraMedicaRepository;
import com.rednorte.agenda.repository.MedicoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

/**
 * Servicio de negocio para la agenda médica.
 *
 * <p>La operación {@link #reservar} usa transacción para garantizar
 * atomicidad: si el slot ya estaba reservado, lanza excepción sin
 * modificar estado (equivalente al FOR UPDATE de la versión Node.js).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgendaService {

    private final HoraMedicaRepository horaRepository;
    private final MedicoRepository medicoRepository;

    // ── Consultas ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<HoraMedicaResponse> getHorasDisponibles(String especialidad) {
        List<HoraMedica> horas = horaRepository.findDisponibles(
                EstadoHora.DISPONIBLE,
                Instant.now(),
                especialidad);
        return horas.stream().map(HoraMedicaResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public HoraMedicaResponse findById(UUID id) {
        return HoraMedicaResponse.from(findHoraOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<HoraMedicaResponse> getHorasBySolicitud(UUID solicitudId) {
        return horaRepository.findBySolicitudId(solicitudId)
                .stream().map(HoraMedicaResponse::from).toList();
    }

    // ── Comandos ──────────────────────────────────────────────────────────

    /**
     * Crea una nueva hora disponible en la agenda de un médico.
     */
    @Transactional
    public HoraMedicaResponse crear(CrearHoraRequest request) {
        Medico medico = medicoRepository.findById(request.getMedicoId())
                .orElseThrow(() -> new NoSuchElementException(
                        "Médico no encontrado: " + request.getMedicoId()));

        HoraMedica hora = HoraMedica.builder()
                .medico(medico)
                .fechaHora(request.getFechaHora())
                .duracionMin(request.getDuracionMin())
                .estado(EstadoHora.DISPONIBLE)
                .observaciones(request.getObservaciones())
                .build();

        HoraMedica guardada = horaRepository.save(hora);
        log.info("[ms-agenda-medica] Hora creada id={} medico={}", guardada.getId(), medico.getNombre());
        return HoraMedicaResponse.from(guardada);
    }

    /**
     * Reserva una hora para un paciente de forma atómica.
     * Lanza {@link IllegalStateException} si la hora ya no está disponible.
     */
    @Transactional
    public HoraMedicaResponse reservar(ReservarHoraRequest request) {
        HoraMedica hora = findHoraOrThrow(request.getHoraId());

        if (hora.getEstado() != EstadoHora.DISPONIBLE) {
            throw new IllegalStateException(
                    "La hora " + request.getHoraId() + " ya no está disponible (estado: " + hora.getEstado() + ")");
        }

        hora.setEstado(EstadoHora.RESERVADA);
        hora.setSolicitudId(request.getSolicitudId());
        hora.setPacienteRut(request.getPacienteRut());
        hora.setPacienteNombre(request.getPacienteNombre());
        if (request.getObservaciones() != null) {
            hora.setObservaciones(request.getObservaciones());
        }

        HoraMedica actualizada = horaRepository.save(hora);
        log.info("[ms-agenda-medica] Hora reservada id={} paciente={}",
                actualizada.getId(), request.getPacienteRut());
        return HoraMedicaResponse.from(actualizada);
    }

    /**
     * Libera una hora previamente reservada (cancela la reserva).
     */
    @Transactional
    public HoraMedicaResponse liberar(UUID horaId, String motivo) {
        HoraMedica hora = findHoraOrThrow(horaId);

        if (hora.getEstado() == EstadoHora.COMPLETADA) {
            throw new IllegalStateException("No se puede liberar una hora completada");
        }

        hora.setEstado(EstadoHora.DISPONIBLE);
        hora.setSolicitudId(null);
        hora.setPacienteRut(null);
        hora.setPacienteNombre(null);
        hora.setObservaciones(motivo);

        HoraMedica liberada = horaRepository.save(hora);
        log.info("[ms-agenda-medica] Hora liberada id={}", horaId);
        return HoraMedicaResponse.from(liberada);
    }

    /**
     * Marca una hora como completada (la cita ocurrió).
     */
    @Transactional
    public HoraMedicaResponse completar(UUID horaId) {
        HoraMedica hora = findHoraOrThrow(horaId);

        if (hora.getEstado() != EstadoHora.RESERVADA) {
            throw new IllegalStateException("Solo se pueden completar horas en estado RESERVADA");
        }

        hora.setEstado(EstadoHora.COMPLETADA);
        return HoraMedicaResponse.from(horaRepository.save(hora));
    }

    // ── helpers ───────────────────────────────────────────────────────────

    private HoraMedica findHoraOrThrow(UUID id) {
        return horaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Hora no encontrada: " + id));
    }
}
