require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connect: connectRabbitMQ, subscribe, EVENTS } = require('../../../shared/events/rabbitmq');
const repository = require('./repositories/pacientesRepository');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/pacientes', require('./routes/pacientesRoutes'));
app.get('/health', (_, res) => res.json({ service: 'ms-pacientes', status: 'ok', port: PORT }));

async function setupConsumers() {
  // Registra cada reasignación en el historial del paciente
  await subscribe('pacientes.cita-reasignada', EVENTS.CITA_REASIGNADA, async (payload) => {
    const { paciente_id, solicitud_id, especialidad, hora_id } = payload;
    await repository.registrarCitaEnHistorial({
      paciente_id, solicitud_id, especialidad, estado: 'asignada',
    });
    console.log(`[ms-pacientes] Historial actualizado para paciente ${paciente_id}`);
  });

  // Crea un registro de notificación cuando se requiere
  await subscribe('pacientes.notificacion', EVENTS.NOTIFICACION_REQUERIDA, async (payload) => {
    const { paciente_id, tipo, mensaje, canal } = payload;
    const canales = Array.isArray(canal) ? canal : [canal];
    for (const c of canales) {
      await repository.createNotificacion({ paciente_id, tipo, mensaje, canal: c });
    }
  });
}

async function start() {
  try {
    await connectRabbitMQ(process.env.RABBITMQ_URL);
    await setupConsumers();
    app.listen(PORT, () => console.log(`[ms-pacientes] Escuchando en puerto ${PORT}`));
  } catch (err) {
    console.error('[ms-pacientes] Error al iniciar:', err.message);
    process.exit(1);
  }
}

start();
