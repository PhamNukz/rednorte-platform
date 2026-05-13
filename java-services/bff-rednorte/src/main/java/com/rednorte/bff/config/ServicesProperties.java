package com.rednorte.bff.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Mapea la sección "services:" del application.yml.
 * Centraliza las URLs de los microservicios downstream.
 */
@Data
@ConfigurationProperties(prefix = "services")
public class ServicesProperties {

    private ServiceUrl listaEspera = new ServiceUrl();
    private ServiceUrl agendaMedica = new ServiceUrl();
    private ServiceUrl pacientes = new ServiceUrl();
    private ServiceUrl reportes = new ServiceUrl();

    @Data
    public static class ServiceUrl {
        private String url;
    }
}
