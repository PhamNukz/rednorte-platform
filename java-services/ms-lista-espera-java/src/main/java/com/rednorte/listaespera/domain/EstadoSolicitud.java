package com.rednorte.listaespera.domain;

/**
 * Estados del ciclo de vida de una solicitud de lista de espera.
 *
 * <pre>
 *  PENDIENTE → EN_ESPERA → ASIGNADA → COMPLETADA
 *                   └──────────────→ CANCELADA
 * </pre>
 */
public enum EstadoSolicitud {
    PENDIENTE,
    EN_ESPERA,
    ASIGNADA,
    CANCELADA,
    COMPLETADA
}
