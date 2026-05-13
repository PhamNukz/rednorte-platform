-- ============================================================
-- V1 — Esquema inicial ms-agenda-medica-java
-- ============================================================

CREATE TYPE estado_hora AS ENUM ('disponible','reservada','cancelada','completada');

CREATE TABLE IF NOT EXISTS medicos (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre        VARCHAR(150) NOT NULL,
    especialidad  VARCHAR(100) NOT NULL,
    hospital      VARCHAR(150),
    rut           VARCHAR(12)  UNIQUE,
    activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS horas_medicas (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    medico_id       UUID         NOT NULL REFERENCES medicos(id),
    fecha_hora      TIMESTAMPTZ  NOT NULL,
    duracion_min    INTEGER      NOT NULL DEFAULT 30,
    estado          estado_hora  NOT NULL DEFAULT 'disponible',
    solicitud_id    UUID,        -- referencia a ms-lista-espera (cross-service)
    paciente_rut    VARCHAR(12),
    paciente_nombre VARCHAR(150),
    observaciones   TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_horas_medico        ON horas_medicas(medico_id);
CREATE INDEX idx_horas_estado        ON horas_medicas(estado);
CREATE INDEX idx_horas_fecha         ON horas_medicas(fecha_hora);
CREATE INDEX idx_medicos_especialidad ON medicos(especialidad);

-- Medicos de ejemplo para demo
INSERT INTO medicos (nombre, especialidad, hospital) VALUES
    ('Dr. Carlos Muñoz',    'cardiologia',  'Hospital de Antofagasta'),
    ('Dra. Ana Torres',     'neurologia',   'Hospital de Iquique'),
    ('Dr. Roberto Pérez',   'traumatologia','Hospital de Calama'),
    ('Dra. Carmen Vidal',   'oncologia',    'Hospital de Antofagasta');
