-- ============================================================
--  SEED: db-espera  (usuarios médicos + pacientes + solicitudes)
--  Contraseña de todos los usuarios: Admin1234
--  Hash bcrypt(10) de "Admin1234":
--  $2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS
-- ============================================================

-- ── 1. USUARIOS MÉDICOS ──────────────────────────────────────
INSERT INTO usuarios (rut, nombre, email, password_hash, rol) VALUES
  ('44444444-4', 'Dr. Carlos Muñoz',    'carlos.munoz@rednorte.cl',    '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'medico'),
  ('55555555-5', 'Dra. Carmen Vidal',   'carmen.vidal@rednorte.cl',    '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'medico'),
  ('66666666-6', 'Dr. Roberto Pérez',   'roberto.perez@rednorte.cl',   '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'medico'),
  ('77777777-7', 'Dra. Sofía Morales',  'sofia.morales@rednorte.cl',   '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'medico'),
  ('88888888-8', 'Dr. Andrés Castillo', 'andres.castillo@rednorte.cl', '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'medico'),
  ('99999999-9', 'Dra. Valeria Rojas',  'valeria.rojas@rednorte.cl',   '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'medico')
ON CONFLICT (rut) DO NOTHING;

-- ── 2. USUARIOS PACIENTES DE PRUEBA ─────────────────────────
INSERT INTO usuarios (rut, nombre, email, password_hash, rol) VALUES
  ('12345678-K', 'María González',   'maria.gonzalez@mail.cl',   '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'paciente'),
  ('23456789-0', 'Juan Pérez',       'juan.perez@mail.cl',       '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'paciente'),
  ('34567890-1', 'Rosa Martínez',    'rosa.martinez@mail.cl',    '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'paciente'),
  ('45678901-2', 'Carlos Díaz',      'carlos.diaz@mail.cl',      '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'paciente'),
  ('56789012-3', 'Elena Soto',       'elena.soto@mail.cl',       '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'paciente'),
  ('67890123-4', 'Pedro Ramírez',    'pedro.ramirez@mail.cl',    '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'paciente'),
  ('78901234-5', 'Carmen López',     'carmen.lopez@mail.cl',     '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'paciente'),
  ('89012345-6', 'Luis Flores',      'luis.flores@mail.cl',      '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'paciente')
ON CONFLICT (rut) DO NOTHING;

-- ── 3. SOLICITUDES DE EJEMPLO ────────────────────────────────
-- Usamos gen_random_uuid() para paciente_id y creado_por ya que
-- en este punto no hay relación FK cruzada entre servicios.
INSERT INTO solicitudes
  (paciente_id, rut_paciente, nombre_paciente, tipo, especialidad, prioridad, estado, descripcion, hospital_origen, creado_por)
VALUES
  -- Urgencias
  (gen_random_uuid(), '12345678-K', 'María González',   'urgencia',    'Cardiología',      'critica',  'en_espera',  'Dolor torácico con dificultad respiratoria',   'Hospital Dr. Juan Noé',     gen_random_uuid()),
  (gen_random_uuid(), '23456789-0', 'Juan Pérez',       'urgencia',    'Traumatología',    'alta',     'en_espera',  'Fractura expuesta de tibia derecha',           'Hospital Luis Calvo Mackenna', gen_random_uuid()),
  (gen_random_uuid(), '34567890-1', 'Rosa Martínez',    'urgencia',    'Neurología',       'critica',  'en_espera',  'Cefalea intensa con vómitos, posible ACV',     'Hospital RedNorte Norte',    gen_random_uuid()),
  -- Programadas
  (gen_random_uuid(), '45678901-2', 'Carlos Díaz',      'programada',  'Medicina General', 'baja',     'pendiente',  'Control anual de presión arterial',            'CESFAM San Camilo',         gen_random_uuid()),
  (gen_random_uuid(), '56789012-3', 'Elena Soto',       'programada',  'Ginecología',      'media',    'pendiente',  'Control ginecológico preventivo',              'CESFAM Los Alpes',          gen_random_uuid()),
  (gen_random_uuid(), '67890123-4', 'Pedro Ramírez',    'programada',  'Traumatología',    'media',    'pendiente',  'Seguimiento post-operatorio rodilla izquierda','Hospital RedNorte Sur',     gen_random_uuid()),
  (gen_random_uuid(), '78901234-5', 'Carmen López',     'programada',  'Dermatología',     'baja',     'pendiente',  'Evaluación de lesión cutánea en espalda',      'CESFAM Centro',             gen_random_uuid()),
  (gen_random_uuid(), '89012345-6', 'Luis Flores',      'programada',  'Pediatría',        'media',    'pendiente',  'Control de desarrollo 2 años',                 'CESFAM Norte',              gen_random_uuid()),
  -- Procedimientos
  (gen_random_uuid(), '12345678-K', 'María González',   'procedimiento','Cardiología',     'alta',     'en_espera',  'Ecocardiograma doppler solicitado por cardiólogo', 'Hospital RedNorte Norte', gen_random_uuid()),
  (gen_random_uuid(), '23456789-0', 'Juan Pérez',       'procedimiento','Neurología',      'media',    'en_espera',  'Electroencefalograma de rutina',               'Clínica RedNorte Centro',   gen_random_uuid()),
  -- Quirúrgicas
  (gen_random_uuid(), '45678901-2', 'Carlos Díaz',      'quirurgica',  'Cirugía General',  'alta',     'en_espera',  'Colecistectomía laparoscópica programada',     'Hospital RedNorte Sur',     gen_random_uuid()),
  (gen_random_uuid(), '67890123-4', 'Pedro Ramírez',    'quirurgica',  'Traumatología',    'media',    'pendiente',  'Artroscopía de rodilla derecha',               'Hospital RedNorte Norte',   gen_random_uuid()),
  -- Asignadas (simulan solicitudes que ya tienen hora)
  (gen_random_uuid(), '34567890-1', 'Rosa Martínez',    'programada',  'Medicina General', 'baja',     'asignada',   'Control de diabetes tipo 2',                   'CESFAM Sur',                gen_random_uuid()),
  -- Completadas / historial
  (gen_random_uuid(), '56789012-3', 'Elena Soto',       'programada',  'Ginecología',      'baja',     'completada', 'Papanicolaou y examen ginecológico',           'CESFAM Los Alpes',          gen_random_uuid()),
  (gen_random_uuid(), '78901234-5', 'Carmen López',     'urgencia',    'Traumatología',    'alta',     'completada', 'Esguince de tobillo',                          'Hospital RedNorte Norte',   gen_random_uuid()),
  (gen_random_uuid(), '89012345-6', 'Luis Flores',      'programada',  'Pediatría',        'baja',     'cancelada',  'Cancelado por paciente',                       'CESFAM Norte',              gen_random_uuid());

-- Actualiza la fecha de asignación para las que están asignadas/completadas
UPDATE solicitudes
SET fecha_asignacion = NOW() - INTERVAL '5 days'
WHERE estado IN ('asignada', 'completada');

-- ── Verificación ─────────────────────────────────────────────
SELECT 'usuarios'    AS tabla, COUNT(*)::text AS total FROM usuarios
UNION ALL
SELECT 'solicitudes' AS tabla, COUNT(*)::text AS total FROM solicitudes
UNION ALL
SELECT estado::text, COUNT(*)::text FROM solicitudes GROUP BY estado;
