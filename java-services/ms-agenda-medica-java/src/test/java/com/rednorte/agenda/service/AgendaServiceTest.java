package com.rednorte.agenda.service;

import com.rednorte.agenda.domain.EstadoHora;
import com.rednorte.agenda.domain.HoraMedica;
import com.rednorte.agenda.domain.Medico;
import com.rednorte.agenda.dto.HoraMedicaResponse;
import com.rednorte.agenda.dto.ReservarHoraRequest;
import com.rednorte.agenda.repository.HoraMedicaRepository;
import com.rednorte.agenda.repository.MedicoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios del AgendaService con Mockito.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AgendaService — lógica de negocio")
class AgendaServiceTest {

    @Mock
    private HoraMedicaRepository horaRepository;

    @Mock
    private MedicoRepository medicoRepository;

    @InjectMocks
    private AgendaService agendaService;

    private UUID horaId;
    private Medico medico;
    private HoraMedica horaDisponible;

    @BeforeEach
    void setUp() {
        horaId = UUID.randomUUID();
        medico = Medico.builder()
                .id(UUID.randomUUID())
                .nombre("Dr. Pérez")
                .especialidad("cardiologia")
                .hospital("Hospital Norte")
                .build();

        horaDisponible = HoraMedica.builder()
                .id(horaId)
                .medico(medico)
                .fechaHora(Instant.now().plus(1, ChronoUnit.DAYS))
                .duracionMin(30)
                .estado(EstadoHora.DISPONIBLE)
                .build();
    }

    @Nested
    @DisplayName("reservar()")
    class Reservar {

        @Test
        @DisplayName("Debe reservar hora disponible y asignar datos del paciente")
        void debeReservarHoraDisponible() {
            when(horaRepository.findById(horaId)).thenReturn(Optional.of(horaDisponible));
            when(horaRepository.save(any())).thenReturn(horaDisponible);

            ReservarHoraRequest req = new ReservarHoraRequest();
            req.setHoraId(horaId);
            req.setPacienteRut("12345678-9");
            req.setPacienteNombre("Ana García");
            req.setSolicitudId(UUID.randomUUID());

            agendaService.reservar(req);

            ArgumentCaptor<HoraMedica> captor = ArgumentCaptor.forClass(HoraMedica.class);
            verify(horaRepository).save(captor.capture());

            HoraMedica guardada = captor.getValue();
            assertThat(guardada.getEstado()).isEqualTo(EstadoHora.RESERVADA);
            assertThat(guardada.getPacienteRut()).isEqualTo("12345678-9");
            assertThat(guardada.getPacienteNombre()).isEqualTo("Ana García");
        }

        @Test
        @DisplayName("Debe lanzar IllegalStateException si la hora ya está reservada")
        void debeLanzarExcepcionSiYaEstaReservada() {
            horaDisponible.setEstado(EstadoHora.RESERVADA);
            when(horaRepository.findById(horaId)).thenReturn(Optional.of(horaDisponible));

            ReservarHoraRequest req = new ReservarHoraRequest();
            req.setHoraId(horaId);
            req.setPacienteRut("11111111-1");
            req.setPacienteNombre("Pedro Test");

            assertThatThrownBy(() -> agendaService.reservar(req))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("ya no está disponible");

            verify(horaRepository, never()).save(any());
        }

        @Test
        @DisplayName("Debe lanzar NoSuchElementException si la hora no existe")
        void debeLanzarExcepcionSiNoExiste() {
            when(horaRepository.findById(any())).thenReturn(Optional.empty());

            ReservarHoraRequest req = new ReservarHoraRequest();
            req.setHoraId(UUID.randomUUID());
            req.setPacienteRut("11111111-1");
            req.setPacienteNombre("Test");

            assertThatThrownBy(() -> agendaService.reservar(req))
                    .isInstanceOf(java.util.NoSuchElementException.class);
        }
    }

    @Nested
    @DisplayName("liberar()")
    class Liberar {

        @Test
        @DisplayName("Debe liberar hora reservada y limpiar datos del paciente")
        void debeLiberarHoraReservada() {
            horaDisponible.setEstado(EstadoHora.RESERVADA);
            horaDisponible.setPacienteRut("12345678-9");
            horaDisponible.setPacienteNombre("María Test");

            when(horaRepository.findById(horaId)).thenReturn(Optional.of(horaDisponible));
            when(horaRepository.save(any())).thenReturn(horaDisponible);

            agendaService.liberar(horaId, "Paciente canceló");

            ArgumentCaptor<HoraMedica> captor = ArgumentCaptor.forClass(HoraMedica.class);
            verify(horaRepository).save(captor.capture());

            HoraMedica liberada = captor.getValue();
            assertThat(liberada.getEstado()).isEqualTo(EstadoHora.DISPONIBLE);
            assertThat(liberada.getPacienteRut()).isNull();
            assertThat(liberada.getPacienteNombre()).isNull();
        }

        @Test
        @DisplayName("No debe permitir liberar una hora COMPLETADA")
        void noDebePermitirLiberarCompletada() {
            horaDisponible.setEstado(EstadoHora.COMPLETADA);
            when(horaRepository.findById(horaId)).thenReturn(Optional.of(horaDisponible));

            assertThatThrownBy(() -> agendaService.liberar(horaId, "motivo"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("No se puede liberar una hora completada");
        }
    }

    @Nested
    @DisplayName("completar()")
    class Completar {

        @Test
        @DisplayName("Debe marcar como COMPLETADA una hora RESERVADA")
        void debeCompletarHoraReservada() {
            horaDisponible.setEstado(EstadoHora.RESERVADA);
            when(horaRepository.findById(horaId)).thenReturn(Optional.of(horaDisponible));
            when(horaRepository.save(any())).thenReturn(horaDisponible);

            agendaService.completar(horaId);

            ArgumentCaptor<HoraMedica> captor = ArgumentCaptor.forClass(HoraMedica.class);
            verify(horaRepository).save(captor.capture());
            assertThat(captor.getValue().getEstado()).isEqualTo(EstadoHora.COMPLETADA);
        }

        @Test
        @DisplayName("Debe lanzar excepción al completar una hora DISPONIBLE")
        void debeLanzarExcepcionSiNoEstaReservada() {
            when(horaRepository.findById(horaId)).thenReturn(Optional.of(horaDisponible));

            assertThatThrownBy(() -> agendaService.completar(horaId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Solo se pueden completar horas en estado RESERVADA");
        }
    }
}
