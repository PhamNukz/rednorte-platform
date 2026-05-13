package com.rednorte.bff.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class ServiceUnavailableException extends RuntimeException {
    public ServiceUnavailableException(String serviceName) {
        super("Servicio no disponible: " + serviceName +
              ". El Circuit Breaker ha abierto el circuito.");
    }
}
