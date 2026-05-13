package com.rednorte.listaespera.domain;

/**
 * Niveles de prioridad clínica para las solicitudes de lista de espera.
 * El orden URGENTE > ALTA > MEDIA > BAJA define el criterio de atención.
 */
public enum Prioridad {
    URGENTE,
    ALTA,
    MEDIA,
    BAJA
}
