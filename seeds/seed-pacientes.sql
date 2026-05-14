-- ============================================================
--  SEED: db-pacientes  (perfiles de pacientes)
-- ============================================================

INSERT INTO pacientes (rut, nombre, apellido, fecha_nacimiento, email, telefono, direccion, consentimiento_datos)
VALUES
  ('12345678-K', 'María',    'González Rojas',    '1985-03-15', 'maria.gonzalez@mail.cl',   '+56912345678', 'Av. Arturo Prat 1234, Iquique',          TRUE),
  ('23456789-0', 'Juan',     'Pérez Sánchez',     '1978-07-22', 'juan.perez@mail.cl',       '+56923456789', 'Calle O''Higgins 567, Arica',             TRUE),
  ('34567890-1', 'Rosa',     'Martínez Álvarez',  '1992-11-08', 'rosa.martinez@mail.cl',    '+56934567890', 'Los Leones 890, Iquique',                 TRUE),
  ('45678901-2', 'Carlos',   'Díaz Fuentes',      '1965-04-30', 'carlos.diaz@mail.cl',      '+56945678901', 'Serrano 321, Iquique',                    TRUE),
  ('56789012-3', 'Elena',    'Soto Vargas',       '2001-09-17', 'elena.soto@mail.cl',       '+56956789012', 'Av. Independencia 456, Arica',            TRUE),
  ('67890123-4', 'Pedro',    'Ramírez Torres',    '1955-12-03', 'pedro.ramirez@mail.cl',    '+56967890123', 'Patricio Lynch 789, Iquique',             TRUE),
  ('78901234-5', 'Carmen',   'López Castillo',    '1988-06-25', 'carmen.lopez@mail.cl',     '+56978901234', 'Juan Martínez 135, Arica',                TRUE),
  ('89012345-6', 'Luis',     'Flores Herrera',    '2022-02-10', 'luis.flores@mail.cl',      '+56989012345', 'Av. Los Alpes 246, Iquique',              TRUE),
  -- Pacientes sin email (contacto solo telefónico)
  ('90123456-7', 'Ana',      'Valdés Moreno',     '1973-08-14', NULL,                       '+56990123456', 'Baquedano 357, Iquique',                  TRUE),
  ('01234567-8', 'Francisco','Navarro Ríos',      '1949-01-20', NULL,                       '+56901234567', 'Vicuña Mackenna 468, Arica',              FALSE)
ON CONFLICT (rut) DO NOTHING;

-- Historial de citas para dar contexto
INSERT INTO historial_citas
  (paciente_id, solicitud_id, especialidad, medico_nombre, hospital, fecha_cita, estado, observaciones)
SELECT
  p.id,
  gen_random_uuid(),
  'Ginecología',
  'Dra. Carmen Vidal',
  'Hospital RedNorte Sur',
  NOW() - INTERVAL '30 days',
  'completada',
  'Papanicolaou normal. Control en 1 año.'
FROM pacientes p WHERE p.rut = '56789012-3';

INSERT INTO historial_citas
  (paciente_id, solicitud_id, especialidad, medico_nombre, hospital, fecha_cita, estado, observaciones)
SELECT
  p.id,
  gen_random_uuid(),
  'Traumatología',
  'Dr. Luis Méndez',
  'Hospital RedNorte Sur',
  NOW() - INTERVAL '15 days',
  'completada',
  'Esguince leve. Reposo 5 días y antiinflamatorio.'
FROM pacientes p WHERE p.rut = '78901234-5';

INSERT INTO historial_citas
  (paciente_id, solicitud_id, especialidad, medico_nombre, hospital, fecha_cita, estado, observaciones)
SELECT
  p.id,
  gen_random_uuid(),
  'Medicina General',
  'Dr. Carlos Muñoz',
  'Hospital RedNorte Norte',
  NOW() - INTERVAL '7 days',
  'completada',
  'HbA1c 7.2%. Ajuste de metformina a 1000mg.'
FROM pacientes p WHERE p.rut = '34567890-1';

-- Notificaciones de ejemplo
INSERT INTO notificaciones_paciente (paciente_id, tipo, mensaje, canal, estado)
SELECT
  p.id,
  'recordatorio_cita',
  'Recordatorio: Tiene una cita de Cardiología el ' || TO_CHAR(NOW() + INTERVAL '3 days', 'DD/MM/YYYY') || ' a las 09:00 hrs en Hospital RedNorte Norte.',
  'email',
  'pendiente'
FROM pacientes p WHERE p.rut = '12345678-K';

INSERT INTO notificaciones_paciente (paciente_id, tipo, mensaje, canal, estado)
SELECT
  p.id,
  'hora_disponible',
  'Hay horas disponibles de Traumatología esta semana. Ingresa al portal para reservar.',
  'sms',
  'enviada'
FROM pacientes p WHERE p.rut = '23456789-0';

-- Verificación
SELECT 'pacientes'          AS tabla, COUNT(*) AS total FROM pacientes
UNION ALL
SELECT 'historial_citas'    AS tabla, COUNT(*) AS total FROM historial_citas
UNION ALL
SELECT 'notificaciones'     AS tabla, COUNT(*) AS total FROM notificaciones_paciente;
