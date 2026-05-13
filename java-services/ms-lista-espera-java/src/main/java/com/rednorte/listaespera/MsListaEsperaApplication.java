package com.rednorte.listaespera;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Microservicio Java — Gestión de Lista de Espera Hospitalaria.
 *
 * <p>Expone API REST para crear y gestionar solicitudes de pacientes
 * que aguardan atención médica especializada en la red RedNorte.
 *
 * <p>Puerto: 8081
 */
@SpringBootApplication
public class MsListaEsperaApplication {
    public static void main(String[] args) {
        SpringApplication.run(MsListaEsperaApplication.class, args);
    }
}
