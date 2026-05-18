require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connect: connectRabbitMQ, subscribe, EVENTS } = require('../../../shared/events/rabbitmq');
const { handleCitaCancelada, handlePacienteRegistrado } = require('./events/reasignacionHandler');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/reasignaciones', require('./routes/reasignacionRoutes'));
app.get('/health', (_, res) => res.json({ service: 'ms-reasignacion', status: 'ok', port: PORT }));

async function start() {
  try {
    await connectRabbitMQ(process.env.RABBITMQ_URL);
    // Suscribirse a cancelaciones de citas
    await subscribe('reasignacion.cita-cancelada', EVENTS.CITA_CANCELADA, handleCitaCancelada);
    // Suscribirse a nuevas solicitudes para asignación automática inmediata
    await subscribe('reasignacion.paciente-registrado', EVENTS.PACIENTE_REGISTRADO, handlePacienteRegistrado);
    app.listen(PORT, () => console.log(`[ms-reasignacion] Escuchando en puerto ${PORT}`));
  } catch (err) {
    console.error('[ms-reasignacion] Error al iniciar:', err.message);
    process.exit(1);
  }
}

start();
