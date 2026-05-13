package com.rednorte.agenda;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Microservicio Java — Agenda Médica RedNorte.
 *
 * <p>Gestiona horas médicas disponibles, reservas y liberación de slots
 * para la red de hospitales del norte de Chile.
 *
 * <p>Puerto: 8082
 */
@SpringBootApplication
public class MsAgendaMedicaApplication {
    public static void main(String[] args) {
        SpringApplication.run(MsAgendaMedicaApplication.class, args);
    }
}
