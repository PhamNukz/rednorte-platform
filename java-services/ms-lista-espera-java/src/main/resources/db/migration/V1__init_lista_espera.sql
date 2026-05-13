-- ============================================================
-- V1 — Esquema inicial ms-lista-espera-java
-- ============================================================

CREATE TYPE tipo_solicitud   AS ENUM ('urgencia','programada','procedimiento','quirurgica');
CREATE TYPE prioridad_enum   AS ENUM ('urgente','alta','media','baja');
CREATE TYPE estado_solicitud AS ENUM ('pendiente','en_espera','asignada','cancelada','completada');

CREATE TABLE IF NOT EXISTS solicitudes (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id      VARCHAR(50),
    rut_paciente     VARCHAR(12)  NOT NULL,
    nombre_paciente  VARCHAR(150) NOT NULL,
    tipo             tipo_solicitud NOT NULL,
    especialidad     VARCHAR(100) NOT NULL,
    prioridad        prioridad_enum NOT NULL DEFAULT 'media',
    estado           estado_solicitud NOT NULL DEFAULT 'pendiente',
    descripcion      TEXT,
    hospital_origen  VARCHAR(150),
    fecha_ingreso    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    fecha_asignacion TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS historial_estados (
    id             BIGSERIAL    PRIMARY KEY,
    solicitud_id   UUID         NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    estado_anterior estado_solicitud,
    estado_nuevo   estado_solicitud NOT NULL,
    motivo         TEXT,
    usuario_id     VARCHAR(50),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_solicitudes_estado       ON solicitudes(estado);
CREATE INDEX idx_solicitudes_especialidad ON solicitudes(especialidad);
CREATE INDEX idx_solicitudes_prioridad    ON solicitudes(prioridad);
CREATE INDEX idx_historial_solicitud      ON historial_estados(solicitud_id);
