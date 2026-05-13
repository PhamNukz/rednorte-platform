package com.rednorte.listaespera.domain;

/**
 * Tipos de solicitud de lista de espera.
 * Patrón Factory Method — cada tipo puede tener una prioridad por defecto diferente.
 */
public enum TipoSolicitud {
    URGENCIA,
    PROGRAMADA,
    PROCEDIMIENTO,
    QUIRURGICA
}
