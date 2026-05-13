package com.rednorte.listaespera.service;

import com.rednorte.listaespera.domain.EstadoSolicitud;
import com.rednorte.listaespera.domain.Prioridad;
import com.rednorte.listaespera.domain.Solicitud;
import com.rednorte.listaespera.domain.TipoSolicitud;
import com.rednorte.listaespera.dto.ActualizarEstadoRequest;
import com.rednorte.listaespera.dto.CrearSolicitudRequest;
import com.rednorte.listaespera.dto.SolicitudResponse;
import com.rednorte.listaespera.repository.SolicitudRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios del SolicitudService con Mockito.
 * No levanta contexto Spring — prueba la lógica de negocio aislada.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SolicitudService — lógica de negocio")
class SolicitudServiceTest {

    @Mock
    private SolicitudRepository repository;

    @InjectMocks
    private SolicitudService service;

    private Solicitud solicitudEjemplo;
    private UUID idEjemplo;

    @BeforeEach
    void setUp() {
        idEjemplo = UUID.randomUUID();
        solicitudEjemplo = Solicitud.builder()
                .id(idEjemplo)
                .rutPaciente("12345678-9")
                .nombrePaciente("María González")
                .tipo(TipoSolicitud.URGENCIA)
                .especialidad("cardiologia")
                .prioridad(Prioridad.URGENTE)
                .estado(EstadoSolicitud.EN_ESPERA)
                .hospitalOrigen("Hospital del Norte")
                .build();
    }

    @Nested
    @DisplayName("crear()")
    class Crear {

        @Test
        @DisplayName("Debe persistir solicitud y retornar DTO con los datos correctos")
        void debePersistirYRetornarDTO() {
            CrearSolicitudRequest req = new CrearSolicitudRequest();
            req.setRutPaciente("12345678-9");
            req.setNombrePaciente("María González");
            req.setTipo(TipoSolicitud.URGENCIA);
            req.setEspecialidad("cardiologia");

            when(repository.save(any(Solicitud.class))).thenReturn(solicitudEjemplo);

            SolicitudResponse resp = service.crear(req);

            assertThat(resp.getId()).isEqualTo(idEjemplo);
            assertThat(resp.getPrioridad()).isEqualTo(Prioridad.URGENTE);
            assertThat(resp.getEstado()).isEqualTo(EstadoSolicitud.EN_ESPERA);
            verify(repository, times(1)).save(any(Solicitud.class));
        }

        @Test
        @DisplayName("Debe delegar la creación al SolicitudFactory (no crear la entidad directamente)")
        void debeDelegarAlFactory() {
            CrearSolicitudRequest req = new CrearSolicitudRequest();
            req.setRutPaciente("11111111-1");
            req.setNombrePaciente("Pedro Soto");
            req.setTipo(TipoSolicitud.PROGRAMADA);
            req.setEspecialidad("neurologia");

            Solicitud guardada = Solicitud.builder()
                    .id(UUID.randomUUID())
                    .rutPaciente("11111111-1")
                    .nombrePaciente("Pedro Soto")
                    .tipo(TipoSolicitud.PROGRAMADA)
                    .prioridad(Prioridad.MEDIA)
                    .estado(EstadoSolicitud.PENDIENTE)
                    .especialidad("neurologia")
                    .build();

            when(repository.save(any())).thenReturn(guardada);

            SolicitudResponse resp = service.crear(req);

            // Verifica que el Factory asignó prioridad MEDIA para PROGRAMADA
            ArgumentCaptor<Solicitud> captor = ArgumentCaptor.forClass(Solicitud.class);
            verify(repository).save(captor.capture());
            assertThat(captor.getValue().getPrioridad()).isEqualTo(Prioridad.MEDIA);
            assertThat(captor.getValue().getEstado()).isEqualTo(EstadoSolicitud.PENDIENTE);
        }
    }

    @Nested
    @DisplayName("actualizarEstado()")
    class ActualizarEstado {

        @Test
        @DisplayName("Debe actualizar estado y retornar DTO actualizado")
        void debeActualizarEstado() {
            when(repository.findById(idEjemplo)).thenReturn(Optional.of(solicitudEjemplo));
            when(repository.save(any())).thenReturn(solicitudEjemplo);

            ActualizarEstadoRequest req = new ActualizarEstadoRequest();
            req.setEstado(EstadoSolicitud.ASIGNADA);
            req.setMotivo("Médico disponible");

            service.actualizarEstado(idEjemplo, req);

            verify(repository).save(argThat(s -> s.getEstado() == EstadoSolicitud.ASIGNADA));
        }

        @Test
        @DisplayName("Debe asignar fechaAsignacion cuando el estado es ASIGNADA")
        void debeAsignarFechaAsignacion() {
            solicitudEjemplo.setFechaAsignacion(null);
            when(repository.findById(idEjemplo)).thenReturn(Optional.of(solicitudEjemplo));
            when(repository.save(any())).thenReturn(solicitudEjemplo);

            ActualizarEstadoRequest req = new ActualizarEstadoRequest();
            req.setEstado(EstadoSolicitud.ASIGNADA);

            service.actualizarEstado(idEjemplo, req);

            ArgumentCaptor<Solicitud> captor = ArgumentCaptor.forClass(Solicitud.class);
            verify(repository).save(captor.capture());
            assertThat(captor.getValue().getFechaAsignacion()).isNotNull();
        }

        @Test
        @DisplayName("Debe lanzar NoSuchElementException si la solicitud no existe")
        void debeLanzarExcepcionSiNoExiste() {
            when(repository.findById(any())).thenReturn(Optional.empty());

            ActualizarEstadoRequest req = new ActualizarEstadoRequest();
            req.setEstado(EstadoSolicitud.CANCELADA);

            assertThatThrownBy(() -> service.actualizarEstado(UUID.randomUUID(), req))
                    .isInstanceOf(NoSuchElementException.class)
                    .hasMessageContaining("Solicitud no encontrada");
        }
    }

    @Nested
    @DisplayName("getResumen()")
    class GetResumen {

        @Test
        @DisplayName("Debe retornar mapa con conteos por estado")
        void debeRetornarResumenPorEstado() {
            when(repository.countByEstado(EstadoSolicitud.PENDIENTE)).thenReturn(3L);
            when(repository.countByEstado(EstadoSolicitud.EN_ESPERA)).thenReturn(7L);
            when(repository.countByEstado(EstadoSolicitud.ASIGNADA)).thenReturn(2L);
            when(repository.countByEstado(EstadoSolicitud.CANCELADA)).thenReturn(1L);
            when(repository.countByEstado(EstadoSolicitud.COMPLETADA)).thenReturn(5L);
            when(repository.countByEspecialidad()).thenReturn(List.of());

            var resumen = service.getResumen();

            assertThat(resumen.get("total")).isEqualTo(18L);
            assertThat(resumen.get("en_espera")).isEqualTo(7L);
            assertThat(resumen.get("pendientes")).isEqualTo(3L);
        }
    }

    @Nested
    @DisplayName("getSiguienteElegible()")
    class GetSiguienteElegible {

        @Test
        @DisplayName("Debe retornar la solicitud más urgente en espera")
        void debeRetornarMasUrgente() {
            when(repository.findElegibles(any(), any(), any()))
                    .thenReturn(List.of(solicitudEjemplo));

            SolicitudResponse resp = service.getSiguienteElegible(null);

            assertThat(resp.getId()).isEqualTo(idEjemplo);
            assertThat(resp.getPrioridad()).isEqualTo(Prioridad.URGENTE);
        }

        @Test
        @DisplayName("Debe lanzar excepción si no hay elegibles")
        void debeLanzarExcepcionSiNoHayElegibles() {
            when(repository.findElegibles(any(), any(), any())).thenReturn(List.of());

            assertThatThrownBy(() -> service.getSiguienteElegible("cardiologia"))
                    .isInstanceOf(NoSuchElementException.class)
                    .hasMessageContaining("No hay solicitudes elegibles");
        }
    }
}
