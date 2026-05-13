package com.rednorte.bff;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * BFF (Backend For Frontend) — RedNorte
 *
 * <p>Patrón Facade: agrega y transforma las respuestas de múltiples
 * microservicios en un contrato optimizado para el portal React.
 * Aplica Circuit Breaker (Resilience4j) en cada llamada a servicios downstream.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class BffRednorteApplication {

    public static void main(String[] args) {
        SpringApplication.run(BffRednorteApplication.class, args);
    }
}
