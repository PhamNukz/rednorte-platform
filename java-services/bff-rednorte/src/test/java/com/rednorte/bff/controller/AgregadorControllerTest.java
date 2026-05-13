package com.rednorte.bff.controller;

import com.rednorte.bff.dto.DashboardDTO;
import com.rednorte.bff.dto.SolicitudDTO;
import com.rednorte.bff.exception.GlobalExceptionHandler;
import com.rednorte.bff.service.AgregadorService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AgregadorController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("AgregadorController — REST layer")
class AgregadorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AgregadorService agregadorService;

    @Test
    @DisplayName("GET /api/bff/health → 200 OK")
    void healthCheck() throws Exception {
        mockMvc.perform(get("/api/bff/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("BFF RedNorte OK"));
    }

    @Test
    @DisplayName("GET /api/bff/dashboard → 200 con DashboardDTO")
    void getDashboard() throws Exception {
        DashboardDTO mock = DashboardDTO.builder()
                .solicitudes(DashboardDTO.ResumenSolicitudes.builder()
                        .total(5).pendientes(2).enEspera(3).build())
                .proximasHoras(List.of())
                .generadoEn(Instant.now())
                .build();

        when(agregadorService.getDashboard(isNull())).thenReturn(mock);

        mockMvc.perform(get("/api/bff/dashboard")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solicitudes.total").value(5))
                .andExpect(jsonPath("$.solicitudes.enEspera").value(3))
                .andExpect(jsonPath("$.generadoEn").isNotEmpty());
    }

    @Test
    @DisplayName("GET /api/bff/dashboard?especialidad=cardiologia → 200")
    void getDashboardFiltrado() throws Exception {
        DashboardDTO mock = DashboardDTO.builder()
                .solicitudes(DashboardDTO.ResumenSolicitudes.builder().total(2).build())
                .proximasHoras(List.of())
                .generadoEn(Instant.now())
                .build();

        when(agregadorService.getDashboard("cardiologia")).thenReturn(mock);

        mockMvc.perform(get("/api/bff/dashboard")
                        .param("especialidad", "cardiologia"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solicitudes.total").value(2));
    }

    @Test
    @DisplayName("GET /api/bff/solicitudes/priorizadas → 200 con lista ordenada")
    void getSolicitudesPriorizadas() throws Exception {
        SolicitudDTO s = new SolicitudDTO();
        s.setId("S001"); s.setPrioridad("urgente");

        when(agregadorService.getSolicitudesPriorizadas(isNull())).thenReturn(List.of(s));

        mockMvc.perform(get("/api/bff/solicitudes/priorizadas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("S001"))
                .andExpect(jsonPath("$[0].prioridad").value("urgente"));
    }
}
