-- DB-Pacientes: perfil, historial de citas y notificaciones

CREATE TYPE canal_notif AS ENUM ('email', 'sms', 'push');
CREATE TYPE estado_notif AS ENUM ('pendiente', 'enviada', 'fallida');

CREATE TABLE IF NOT EXISTS pacientes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rut             VARCHAR(12) UNIQUE NOT NULL,
  nombre          VARCHAR(150) NOT NULL,
  apellido        VARCHAR(150) NOT NULL,
  fecha_nacimiento DATE,
  email           VARCHAR(200),
  telefono        VARCHAR(20),
  direccion       TEXT,
  consentimiento_datos BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historial_citas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id     UUID NOT NULL REFERENCES pacientes(id),
  solicitud_id    UUID NOT NULL,
  especialidad    VARCHAR(100) NOT NULL,
  medico_nombre   VARCHAR(150),
  hospital        VARCHAR(150),
  fecha_cita      TIMESTAMPTZ,
  estado          VARCHAR(50) NOT NULL,
  observaciones   TEXT,
  registrado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notificaciones_paciente (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id     UUID NOT NULL REFERENCES pacientes(id),
  tipo            VARCHAR(50) NOT NULL,
  mensaje         TEXT NOT NULL,
  canal           canal_notif NOT NULL,
  estado          estado_notif NOT NULL DEFAULT 'pendiente',
  enviada_en      TIMESTAMPTZ,
  creada_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_historial_paciente   ON historial_citas(paciente_id);
CREATE INDEX idx_notif_paciente       ON notificaciones_paciente(paciente_id);
CREATE INDEX idx_notif_estado         ON notificaciones_paciente(estado);
