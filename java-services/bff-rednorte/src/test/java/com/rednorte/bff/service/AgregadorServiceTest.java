package com.rednorte.bff.service;

import com.rednorte.bff.dto.DashboardDTO;
import com.rednorte.bff.dto.HoraDTO;
import com.rednorte.bff.dto.SolicitudDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

/**
 * Tests unitarios de AgregadorService (Facade / BFF pattern).
 * Verifica la lógica de agregación y priorización sin levantar contexto Spring.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AgregadorService — Facade BFF")
class AgregadorServiceTest {

    @Mock
    private ListaEsperaClientService listaEsperaClient;

    @Mock
    private AgendaClientService agendaClient;

    @InjectMocks
    private AgregadorService agrupadorService;

    private SolicitudDTO solicitudUrgente;
    private SolicitudDTO solicitudMedia;
    private SolicitudDTO solicitudBaja;

    @BeforeEach
    void setUp() {
        solicitudUrgente = new SolicitudDTO();
        solicitudUrgente.setId("S001");
        solicitudUrgente.setPrioridad("urgente");
        solicitudUrgente.setEstado("en_espera");
        solicitudUrgente.setEspecialidad("cardiologia");

        solicitudMedia = new SolicitudDTO();
        solicitudMedia.setId("S002");
        solicitudMedia.setPrioridad("media");
        solicitudMedia.setEstado("pendiente");
        solicitudMedia.setEspecialidad("cardiologia");

        solicitudBaja = new SolicitudDTO();
        solicitudBaja.setId("S003");
        solicitudBaja.setPrioridad("baja");
        solicitudBaja.setEstado("en_espera");
        solicitudBaja.setEspecialidad("neurologia");
    }

    @Nested
    @DisplayName("getDashboard")
    class GetDashboard {

        @Test
        @DisplayName("Debe agregar solicitudes y horas en un único DashboardDTO")
        void debeAgregarsolicitudesYHoras() {
            // Arrange
            List<SolicitudDTO> solicitudes = List.of(solicitudUrgente, solicitudMedia, solicitudBaja);
            HoraDTO hora = new HoraDTO();
            hora.setId("H001");
            hora.setEspecialidad("cardiologia");

            when(listaEsperaClient.getSolicitudes(isNull(), isNull()))
                    .thenReturn(solicitudes);
            when(agendaClient.getProximasHoras(isNull(), eq(5)))
                    .thenReturn(List.of(hora));

            // Act
            DashboardDTO dashboard = agrupadorService.getDashboard(null);

            // Assert
            assertThat(dashboard).isNotNull();
            assertThat(dashboard.getGeneradoEn()).isNotNull();
            assertThat(dashboard.getProximasHoras()).hasSize(1);
            assertThat(dashboard.getSolicitudes().getTotal()).isEqualTo(3);
        }

        @Test
        @DisplayName("Debe contar correctamente solicitudes por estado")
        void debeContarPorEstado() {
            when(listaEsperaClient.getSolicitudes(isNull(), isNull()))
                    .thenReturn(List.of(solicitudUrgente, solicitudMedia, solicitudBaja));
            when(agendaClient.getProximasHoras(isNull(), eq(5))).thenReturn(List.of());

            DashboardDTO.ResumenSolicitudes resumen =
                    agrupadorService.getDashboard(null).getSolicitudes();

            assertThat(resumen.getTotal()).isEqualTo(3);
            assertThat(resumen.getEnEspera()).isEqualTo(2);   // urgente + baja
            assertThat(resumen.getPendientes()).isEqualTo(1); // media
        }

        @Test
        @DisplayName("Debe agrupar solicitudes por especialidad")
        void debeAgruparPorEspecialidad() {
            when(listaEsperaClient.getSolicitudes(isNull(), isNull()))
                    .thenReturn(List.of(solicitudUrgente, solicitudMedia, solicitudBaja));
            when(agendaClient.getProximasHoras(isNull(), eq(5))).thenReturn(List.of());

            DashboardDTO.ResumenSolicitudes resumen =
                    agrupadorService.getDashboard(null).getSolicitudes();

            assertThat(resumen.getPorEspecialidad()).containsKey("cardiologia");
            assertThat(resumen.getPorEspecialidad().get("cardiologia")).isEqualTo(2L);
            assertThat(resumen.getPorEspecialidad().get("neurologia")).isEqualTo(1L);
        }

        @Test
        @DisplayName("Debe retornar dashboard vacío cuando los clientes devuelven listas vacías (Circuit Breaker open)")
        void debeManejarFallbackVacio() {
            when(listaEsperaClient.getSolicitudes(isNull(), isNull())).thenReturn(List.of());
            when(agendaClient.getProximasHoras(isNull(), eq(5))).thenReturn(List.of());

            DashboardDTO dashboard = agrupadorService.getDashboard(null);

            assertThat(dashboard.getSolicitudes().getTotal()).isZero();
            assertThat(dashboard.getProximasHoras()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getSolicitudesPriorizadas")
    class GetSolicitudesPriorizadas {

        @Test
        @DisplayName("Debe retornar solicitudes en_espera ordenadas por prioridad descendente")
        void debeOrdenarPorPrioridad() {
            SolicitudDTO s1 = new SolicitudDTO(); s1.setId("A"); s1.setPrioridad("baja");    s1.setEstado("en_espera");
            SolicitudDTO s2 = new SolicitudDTO(); s2.setId("B"); s2.setPrioridad("urgente"); s2.setEstado("en_espera");
            SolicitudDTO s3 = new SolicitudDTO(); s3.setId("C"); s3.setPrioridad("media");   s3.setEstado("en_espera");

            when(listaEsperaClient.getSolicitudes(eq("en_espera"), isNull()))
                    .thenReturn(List.of(s1, s2, s3));

            List<SolicitudDTO> resultado = agrupadorService.getSolicitudesPriorizadas(null);

            assertThat(resultado).extracting(SolicitudDTO::getId)
                    .containsExactly("B", "C", "A"); // urgente, media, baja
        }

        @Test
        @DisplayName("Debe retornar lista vacía cuando no hay solicitudes en espera")
        void debeRetornarVacioSinSolicitudes() {
            when(listaEsperaClient.getSolicitudes(eq("en_espera"), any())).thenReturn(List.of());

            List<SolicitudDTO> resultado = agrupadorService.getSolicitudesPriorizadas("cardiologia");

            assertThat(resultado).isEmpty();
        }
    }
}
