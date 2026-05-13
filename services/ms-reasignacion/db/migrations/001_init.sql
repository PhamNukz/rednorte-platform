-- DB-Reasignacion: historial de reasignaciones

CREATE TYPE estado_reasignacion AS ENUM ('procesando', 'completada', 'fallida');

CREATE TABLE IF NOT EXISTS reasignaciones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id    UUID NOT NULL,
  paciente_id     UUID NOT NULL,
  hora_anterior_id UUID,
  hora_nueva_id   UUID NOT NULL,
  especialidad    VARCHAR(100) NOT NULL,
  estado          estado_reasignacion NOT NULL DEFAULT 'procesando',
  motivo          TEXT,
  fecha_evento    TIMESTAMPTZ NOT NULL,
  fecha_procesado TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reasig_solicitud   ON reasignaciones(solicitud_id);
CREATE INDEX idx_reasig_paciente    ON reasignaciones(paciente_id);
CREATE INDEX idx_reasig_especialidad ON reasignaciones(especialidad);
