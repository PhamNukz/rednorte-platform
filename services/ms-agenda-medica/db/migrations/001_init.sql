-- DB-Disponibilidad: médicos, agenda y horas disponibles

CREATE TYPE estado_hora AS ENUM ('disponible', 'reservada', 'bloqueada', 'completada');

CREATE TABLE IF NOT EXISTS medicos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rut             VARCHAR(12) UNIQUE NOT NULL,
  nombre          VARCHAR(150) NOT NULL,
  especialidad    VARCHAR(100) NOT NULL,
  hospital        VARCHAR(150) NOT NULL,
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS horas_medicas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id       UUID NOT NULL REFERENCES medicos(id),
  especialidad    VARCHAR(100) NOT NULL,
  hospital        VARCHAR(150) NOT NULL,
  fecha_hora      TIMESTAMPTZ NOT NULL,
  duracion_min    INT NOT NULL DEFAULT 30,
  estado          estado_hora NOT NULL DEFAULT 'disponible',
  solicitud_id    UUID,
  paciente_id     UUID,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_horas_estado       ON horas_medicas(estado);
CREATE INDEX idx_horas_especialidad ON horas_medicas(especialidad);
CREATE INDEX idx_horas_fecha        ON horas_medicas(fecha_hora);
CREATE INDEX idx_horas_medico       ON horas_medicas(medico_id);

-- Seed inicial de médicos y horas de ejemplo
INSERT INTO medicos (rut, nombre, especialidad, hospital) VALUES
  ('11111111-1', 'Dra. Ana Torres', 'Cardiología', 'Hospital RedNorte Norte'),
  ('22222222-2', 'Dr. Luis Méndez', 'Traumatología', 'Hospital RedNorte Sur'),
  ('33333333-3', 'Dra. Paola Ríos', 'Neurología', 'Clínica RedNorte Centro')
ON CONFLICT DO NOTHING;
