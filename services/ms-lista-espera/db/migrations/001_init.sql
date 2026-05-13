-- DB-Espera: pacientes en lista de espera, solicitudes y estados

CREATE TYPE tipo_solicitud AS ENUM ('urgencia', 'programada', 'procedimiento', 'quirurgica');
CREATE TYPE estado_solicitud AS ENUM ('pendiente', 'en_espera', 'asignada', 'cancelada', 'completada');
CREATE TYPE prioridad AS ENUM ('baja', 'media', 'alta', 'critica');

CREATE TABLE IF NOT EXISTS solicitudes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id     UUID NOT NULL,
  rut_paciente    VARCHAR(12) NOT NULL,
  nombre_paciente VARCHAR(150) NOT NULL,
  tipo            tipo_solicitud NOT NULL,
  especialidad    VARCHAR(100) NOT NULL,
  prioridad       prioridad NOT NULL DEFAULT 'media',
  estado          estado_solicitud NOT NULL DEFAULT 'pendiente',
  descripcion     TEXT,
  hospital_origen VARCHAR(150),
  hora_asignada_id UUID,
  fecha_ingreso   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_asignacion TIMESTAMPTZ,
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creado_por      UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS historial_estados (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id    UUID NOT NULL REFERENCES solicitudes(id),
  estado_anterior estado_solicitud,
  estado_nuevo    estado_solicitud NOT NULL,
  comentario      TEXT,
  cambiado_por    UUID NOT NULL,
  fecha_cambio    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para CQRS (lecturas frecuentes por estado y especialidad)
CREATE INDEX idx_solicitudes_estado      ON solicitudes(estado);
CREATE INDEX idx_solicitudes_prioridad   ON solicitudes(prioridad);
CREATE INDEX idx_solicitudes_especialidad ON solicitudes(especialidad);
CREATE INDEX idx_solicitudes_paciente    ON solicitudes(paciente_id);
CREATE INDEX idx_historial_solicitud     ON historial_estados(solicitud_id);
