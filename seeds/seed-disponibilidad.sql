-- ============================================================
--  SEED: db-disponibilidad  (médicos + horas disponibles)
--  Contraseña de todos los usuarios de prueba: Admin1234
-- ============================================================

-- ── 1. MÉDICOS ADICIONALES ───────────────────────────────────
INSERT INTO medicos (rut, nombre, especialidad, hospital) VALUES
  ('44444444-4', 'Dr. Carlos Muñoz',    'Medicina General', 'Hospital RedNorte Norte'),
  ('55555555-5', 'Dra. Carmen Vidal',   'Ginecología',      'Hospital RedNorte Sur'),
  ('66666666-6', 'Dr. Roberto Pérez',   'Traumatología',    'Clínica RedNorte Centro'),
  ('77777777-7', 'Dra. Sofía Morales',  'Pediatría',        'Hospital RedNorte Norte'),
  ('88888888-8', 'Dr. Andrés Castillo', 'Cirugía General',  'Hospital RedNorte Sur'),
  ('99999999-9', 'Dra. Valeria Rojas',  'Dermatología',     'Clínica RedNorte Centro')
ON CONFLICT (rut) DO NOTHING;

-- ── 2. HORAS MÉDICAS (próximas 3 semanas, lunes a viernes) ──
-- Semana +1
-- Dra. Ana Torres (Cardiología)
INSERT INTO horas_medicas (medico_id, especialidad, hospital, fecha_hora, duracion_min)
SELECT id, especialidad, hospital, slot, 30
FROM medicos,
  (VALUES
    (NOW() + INTERVAL '1 day' + TIME '09:00'),
    (NOW() + INTERVAL '1 day' + TIME '10:00'),
    (NOW() + INTERVAL '1 day' + TIME '11:00'),
    (NOW() + INTERVAL '3 days' + TIME '09:00'),
    (NOW() + INTERVAL '3 days' + TIME '15:00'),
    (NOW() + INTERVAL '5 days' + TIME '10:00'),
    (NOW() + INTERVAL '5 days' + TIME '16:00'),
    (NOW() + INTERVAL '8 days' + TIME '09:00'),
    (NOW() + INTERVAL '8 days' + TIME '11:00'),
    (NOW() + INTERVAL '10 days' + TIME '15:00'),
    (NOW() + INTERVAL '12 days' + TIME '09:00'),
    (NOW() + INTERVAL '15 days' + TIME '10:00'),
    (NOW() + INTERVAL '15 days' + TIME '16:00')
  ) AS t(slot)
WHERE rut = '11111111-1';

-- Dr. Luis Méndez (Traumatología)
INSERT INTO horas_medicas (medico_id, especialidad, hospital, fecha_hora, duracion_min)
SELECT id, especialidad, hospital, slot, 45
FROM medicos,
  (VALUES
    (NOW() + INTERVAL '2 days' + TIME '09:00'),
    (NOW() + INTERVAL '2 days' + TIME '10:30'),
    (NOW() + INTERVAL '4 days' + TIME '09:00'),
    (NOW() + INTERVAL '4 days' + TIME '15:00'),
    (NOW() + INTERVAL '6 days' + TIME '11:00'),
    (NOW() + INTERVAL '9 days' + TIME '09:00'),
    (NOW() + INTERVAL '9 days' + TIME '15:30'),
    (NOW() + INTERVAL '11 days' + TIME '10:00'),
    (NOW() + INTERVAL '13 days' + TIME '09:00'),
    (NOW() + INTERVAL '16 days' + TIME '09:00'),
    (NOW() + INTERVAL '16 days' + TIME '15:00')
  ) AS t(slot)
WHERE rut = '22222222-2';

-- Dra. Paola Ríos (Neurología)
INSERT INTO horas_medicas (medico_id, especialidad, hospital, fecha_hora, duracion_min)
SELECT id, especialidad, hospital, slot, 45
FROM medicos,
  (VALUES
    (NOW() + INTERVAL '1 day' + TIME '15:00'),
    (NOW() + INTERVAL '3 days' + TIME '10:00'),
    (NOW() + INTERVAL '3 days' + TIME '16:00'),
    (NOW() + INTERVAL '5 days' + TIME '09:00'),
    (NOW() + INTERVAL '7 days' + TIME '15:00'),
    (NOW() + INTERVAL '10 days' + TIME '09:00'),
    (NOW() + INTERVAL '10 days' + TIME '11:00'),
    (NOW() + INTERVAL '12 days' + TIME '15:00'),
    (NOW() + INTERVAL '14 days' + TIME '09:00'),
    (NOW() + INTERVAL '17 days' + TIME '10:00')
  ) AS t(slot)
WHERE rut = '33333333-3';

-- Dr. Carlos Muñoz (Medicina General)
INSERT INTO horas_medicas (medico_id, especialidad, hospital, fecha_hora, duracion_min)
SELECT id, especialidad, hospital, slot, 20
FROM medicos,
  (VALUES
    (NOW() + INTERVAL '1 day' + TIME '09:00'),
    (NOW() + INTERVAL '1 day' + TIME '09:30'),
    (NOW() + INTERVAL '1 day' + TIME '10:00'),
    (NOW() + INTERVAL '1 day' + TIME '10:30'),
    (NOW() + INTERVAL '2 days' + TIME '09:00'),
    (NOW() + INTERVAL '2 days' + TIME '09:30'),
    (NOW() + INTERVAL '2 days' + TIME '10:00'),
    (NOW() + INTERVAL '4 days' + TIME '09:00'),
    (NOW() + INTERVAL '4 days' + TIME '09:30'),
    (NOW() + INTERVAL '5 days' + TIME '09:00'),
    (NOW() + INTERVAL '5 days' + TIME '09:30'),
    (NOW() + INTERVAL '5 days' + TIME '10:00'),
    (NOW() + INTERVAL '8 days' + TIME '09:00'),
    (NOW() + INTERVAL '8 days' + TIME '09:30'),
    (NOW() + INTERVAL '9 days' + TIME '09:00'),
    (NOW() + INTERVAL '11 days' + TIME '09:00'),
    (NOW() + INTERVAL '12 days' + TIME '09:00'),
    (NOW() + INTERVAL '15 days' + TIME '09:00'),
    (NOW() + INTERVAL '15 days' + TIME '09:30')
  ) AS t(slot)
WHERE rut = '44444444-4';

-- Dra. Carmen Vidal (Ginecología)
INSERT INTO horas_medicas (medico_id, especialidad, hospital, fecha_hora, duracion_min)
SELECT id, especialidad, hospital, slot, 30
FROM medicos,
  (VALUES
    (NOW() + INTERVAL '2 days' + TIME '14:00'),
    (NOW() + INTERVAL '2 days' + TIME '15:00'),
    (NOW() + INTERVAL '2 days' + TIME '16:00'),
    (NOW() + INTERVAL '4 days' + TIME '14:00'),
    (NOW() + INTERVAL '4 days' + TIME '15:00'),
    (NOW() + INTERVAL '6 days' + TIME '09:00'),
    (NOW() + INTERVAL '9 days' + TIME '14:00'),
    (NOW() + INTERVAL '9 days' + TIME '15:00'),
    (NOW() + INTERVAL '11 days' + TIME '14:00'),
    (NOW() + INTERVAL '13 days' + TIME '09:00'),
    (NOW() + INTERVAL '13 days' + TIME '15:00'),
    (NOW() + INTERVAL '16 days' + TIME '14:00')
  ) AS t(slot)
WHERE rut = '55555555-5';

-- Dr. Roberto Pérez (Traumatología)
INSERT INTO horas_medicas (medico_id, especialidad, hospital, fecha_hora, duracion_min)
SELECT id, especialidad, hospital, slot, 45
FROM medicos,
  (VALUES
    (NOW() + INTERVAL '3 days' + TIME '09:00'),
    (NOW() + INTERVAL '3 days' + TIME '11:00'),
    (NOW() + INTERVAL '5 days' + TIME '15:00'),
    (NOW() + INTERVAL '7 days' + TIME '09:00'),
    (NOW() + INTERVAL '10 days' + TIME '09:00'),
    (NOW() + INTERVAL '10 days' + TIME '11:00'),
    (NOW() + INTERVAL '12 days' + TIME '15:00'),
    (NOW() + INTERVAL '14 days' + TIME '09:00'),
    (NOW() + INTERVAL '17 days' + TIME '09:00'),
    (NOW() + INTERVAL '17 days' + TIME '15:00')
  ) AS t(slot)
WHERE rut = '66666666-6';

-- Dra. Sofía Morales (Pediatría)
INSERT INTO horas_medicas (medico_id, especialidad, hospital, fecha_hora, duracion_min)
SELECT id, especialidad, hospital, slot, 30
FROM medicos,
  (VALUES
    (NOW() + INTERVAL '1 day' + TIME '14:00'),
    (NOW() + INTERVAL '1 day' + TIME '15:00'),
    (NOW() + INTERVAL '1 day' + TIME '16:00'),
    (NOW() + INTERVAL '3 days' + TIME '14:00'),
    (NOW() + INTERVAL '3 days' + TIME '16:00'),
    (NOW() + INTERVAL '5 days' + TIME '14:00'),
    (NOW() + INTERVAL '8 days' + TIME '14:00'),
    (NOW() + INTERVAL '8 days' + TIME '15:00'),
    (NOW() + INTERVAL '10 days' + TIME '16:00'),
    (NOW() + INTERVAL '12 days' + TIME '14:00'),
    (NOW() + INTERVAL '15 days' + TIME '14:00'),
    (NOW() + INTERVAL '15 days' + TIME '15:00')
  ) AS t(slot)
WHERE rut = '77777777-7';

-- Dr. Andrés Castillo (Cirugía General)
INSERT INTO horas_medicas (medico_id, especialidad, hospital, fecha_hora, duracion_min)
SELECT id, especialidad, hospital, slot, 60
FROM medicos,
  (VALUES
    (NOW() + INTERVAL '4 days' + TIME '08:00'),
    (NOW() + INTERVAL '6 days' + TIME '08:00'),
    (NOW() + INTERVAL '9 days' + TIME '08:00'),
    (NOW() + INTERVAL '11 days' + TIME '08:00'),
    (NOW() + INTERVAL '13 days' + TIME '08:00'),
    (NOW() + INTERVAL '16 days' + TIME '08:00')
  ) AS t(slot)
WHERE rut = '88888888-8';

-- Dra. Valeria Rojas (Dermatología)
INSERT INTO horas_medicas (medico_id, especialidad, hospital, fecha_hora, duracion_min)
SELECT id, especialidad, hospital, slot, 30
FROM medicos,
  (VALUES
    (NOW() + INTERVAL '2 days' + TIME '11:00'),
    (NOW() + INTERVAL '2 days' + TIME '12:00'),
    (NOW() + INTERVAL '4 days' + TIME '11:00'),
    (NOW() + INTERVAL '4 days' + TIME '12:00'),
    (NOW() + INTERVAL '7 days' + TIME '11:00'),
    (NOW() + INTERVAL '9 days' + TIME '11:00'),
    (NOW() + INTERVAL '11 days' + TIME '12:00'),
    (NOW() + INTERVAL '14 days' + TIME '11:00'),
    (NOW() + INTERVAL '16 days' + TIME '11:00')
  ) AS t(slot)
WHERE rut = '99999999-9';

-- Verificación
SELECT
  m.nombre,
  m.especialidad,
  m.hospital,
  COUNT(h.id) AS horas_disponibles
FROM medicos m
LEFT JOIN horas_medicas h ON h.medico_id = m.id AND h.estado = 'disponible'
GROUP BY m.id, m.nombre, m.especialidad, m.hospital
ORDER BY m.nombre;
