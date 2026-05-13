package com.rednorte.bff.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URI;
import java.time.Instant;

/**
 * Manejador global de excepciones del BFF.
 * Devuelve RFC 7807 ProblemDetail para todos los errores.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ServiceUnavailableException.class)
    public ProblemDetail handleServiceUnavailable(ServiceUnavailableException ex) {
        log.error("[BFF] Servicio no disponible: {}", ex.getMessage());
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
        pd.setTitle("Servicio no disponible");
        pd.setType(URI.create("https://rednorte.cl/errors/service-unavailable"));
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }

    @ExceptionHandler(WebClientResponseException.class)
    public ProblemDetail handleWebClientResponse(WebClientResponseException ex) {
        log.error("[BFF] Error HTTP del microservicio: {} {}", ex.getStatusCode(), ex.getMessage());
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_GATEWAY,
                "Error comunicando con microservicio: " + ex.getMessage());
        pd.setTitle("Bad Gateway");
        pd.setType(URI.create("https://rednorte.cl/errors/bad-gateway"));
        pd.setProperty("timestamp", Instant.now());
        pd.setProperty("upstreamStatus", ex.getStatusCode().value());
        return pd;
    }

    @ExceptionHandler(WebClientRequestException.class)
    public ProblemDetail handleWebClientRequest(WebClientRequestException ex) {
        log.error("[BFF] Error de conexión al microservicio: {}", ex.getMessage());
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.SERVICE_UNAVAILABLE,
                "No se pudo conectar al microservicio: " + ex.getMessage());
        pd.setTitle("Microservicio no alcanzable");
        pd.setType(URI.create("https://rednorte.cl/errors/connection-error"));
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneric(Exception ex) {
        log.error("[BFF] Error no controlado: {}", ex.getMessage(), ex);
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error interno del BFF");
        pd.setTitle("Error interno");
        pd.setType(URI.create("https://rednorte.cl/errors/internal"));
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }
}
