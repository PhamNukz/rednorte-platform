-- Tabla de usuarios para autenticación JWT
CREATE TABLE IF NOT EXISTS usuarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rut           VARCHAR(12) UNIQUE NOT NULL,
  nombre        VARCHAR(150) NOT NULL,
  email         VARCHAR(200),
  password_hash TEXT NOT NULL,
  rol           VARCHAR(20) NOT NULL DEFAULT 'paciente',
  paciente_id   UUID,
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usuarios de prueba (contraseña: Admin1234)
-- Hash generado con bcrypt rounds=10 para "Admin1234"
INSERT INTO usuarios (rut, nombre, email, password_hash, rol) VALUES
  ('12345678-9', 'Admin RedNorte', 'admin@rednorte.cl',
   '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'admin'),
  ('98765432-1', 'Dr. Luis Méndez', 'medico@rednorte.cl',
   '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'medico'),
  ('11111111-1', 'Ana González (Paciente)', 'paciente@rednorte.cl',
   '$2a$10$s6.pqzB7ns42iO.eJim3tOy6.ATD8GPyuqKWwP1H28x7RAgLDAdmS', 'paciente')
ON CONFLICT DO NOTHING;
