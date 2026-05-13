package com.rednorte.listaespera.factory;

import com.rednorte.listaespera.domain.EstadoSolicitud;
import com.rednorte.listaespera.domain.Prioridad;
import com.rednorte.listaespera.domain.Solicitud;
import com.rednorte.listaespera.domain.TipoSolicitud;
import com.rednorte.listaespera.dto.CrearSolicitudRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests unitarios del patrón Factory Method — SolicitudFactory.
 * Verifica que cada tipo clínico genere la prioridad y estado correctos.
 */
@DisplayName("SolicitudFactory — Factory Method pattern")
class SolicitudFactoryTest {

    private CrearSolicitudRequest baseRequest;

    @BeforeEach
    void setUp() {
        baseRequest = new CrearSolicitudRequest();
        baseRequest.setRutPaciente("12345678-9");
        baseRequest.setNombrePaciente("Juan Pérez");
        baseRequest.setEspecialidad("cardiologia");
        baseRequest.setHospitalOrigen("Hospital de Antofagasta");
    }

    @Nested
    @DisplayName("URGENCIA")
    class Urgencia {

        @Test
        @DisplayName("Debe crear solicitud URGENCIA con prioridad URGENTE y estado EN_ESPERA")
        void debeCrearConPrioridadUrgenteYEstadoEnEspera() {
            baseRequest.setTipo(TipoSolicitud.URGENCIA);

            Solicitud s = SolicitudFactory.crear(baseRequest);

            assertThat(s.getTipo()).isEqualTo(TipoSolicitud.URGENCIA);
            assertThat(s.getPrioridad()).isEqualTo(Prioridad.URGENTE);
            assertThat(s.getEstado()).isEqualTo(EstadoSolicitud.EN_ESPERA);
        }

        @Test
        @DisplayName("Debe respetar prioridad explícita si se proporciona")
        void debeRespetarPrioridadExplicita() {
            baseRequest.setTipo(TipoSolicitud.URGENCIA);
            baseRequest.setPrioridad(Prioridad.ALTA);

            Solicitud s = SolicitudFactory.crear(baseRequest);

            assertThat(s.getPrioridad()).isEqualTo(Prioridad.ALTA);
        }
    }

    @Nested
    @DisplayName("PROGRAMADA")
    class Programada {

        @Test
        @DisplayName("Debe crear solicitud PROGRAMADA con prioridad MEDIA y estado PENDIENTE")
        void debeCrearConPrioridadMediaYEstadoPendiente() {
            baseRequest.setTipo(TipoSolicitud.PROGRAMADA);

            Solicitud s = SolicitudFactory.crear(baseRequest);

            assertThat(s.getTipo()).isEqualTo(TipoSolicitud.PROGRAMADA);
            assertThat(s.getPrioridad()).isEqualTo(Prioridad.MEDIA);
            assertThat(s.getEstado()).isEqualTo(EstadoSolicitud.PENDIENTE);
        }
    }

    @Nested
    @DisplayName("PROCEDIMIENTO")
    class Procedimiento {

        @Test
        @DisplayName("Debe crear solicitud PROCEDIMIENTO con prioridad ALTA y estado PENDIENTE")
        void debeCrearConPrioridadAltaYEstadoPendiente() {
            baseRequest.setTipo(TipoSolicitud.PROCEDIMIENTO);

            Solicitud s = SolicitudFactory.crear(baseRequest);

            assertThat(s.getTipo()).isEqualTo(TipoSolicitud.PROCEDIMIENTO);
            assertThat(s.getPrioridad()).isEqualTo(Prioridad.ALTA);
            assertThat(s.getEstado()).isEqualTo(EstadoSolicitud.PENDIENTE);
        }
    }

    @Nested
    @DisplayName("QUIRURGICA")
    class Quirurgica {

        @Test
        @DisplayName("Debe crear solicitud QUIRURGICA con prioridad ALTA y estado PENDIENTE")
        void debeCrearConPrioridadAltaYEstadoPendiente() {
            baseRequest.setTipo(TipoSolicitud.QUIRURGICA);

            Solicitud s = SolicitudFactory.crear(baseRequest);

            assertThat(s.getTipo()).isEqualTo(TipoSolicitud.QUIRURGICA);
            assertThat(s.getPrioridad()).isEqualTo(Prioridad.ALTA);
            assertThat(s.getEstado()).isEqualTo(EstadoSolicitud.PENDIENTE);
        }
    }

    @Nested
    @DisplayName("Datos base del paciente")
    class DatosBase {

        @Test
        @DisplayName("Debe trasladar datos del paciente desde el request a la entidad")
        void debeTrasladarDatosDelPaciente() {
            baseRequest.setTipo(TipoSolicitud.PROGRAMADA);
            baseRequest.setPacienteId("PAC-001");
            baseRequest.setDescripcion("Dolor crónico de pecho");

            Solicitud s = SolicitudFactory.crear(baseRequest);

            assertThat(s.getRutPaciente()).isEqualTo("12345678-9");
            assertThat(s.getNombrePaciente()).isEqualTo("Juan Pérez");
            assertThat(s.getEspecialidad()).isEqualTo("cardiologia");
            assertThat(s.getHospitalOrigen()).isEqualTo("Hospital de Antofagasta");
            assertThat(s.getPacienteId()).isEqualTo("PAC-001");
            assertThat(s.getDescripcion()).isEqualTo("Dolor crónico de pecho");
        }

        @Test
        @DisplayName("El ID no debe estar asignado antes de persistir (lo gestiona JPA)")
        void idDebeSerNuloAntesDeGuardar() {
            baseRequest.setTipo(TipoSolicitud.PROGRAMADA);
            Solicitud s = SolicitudFactory.crear(baseRequest);
            assertThat(s.getId()).isNull();
        }
    }
}
