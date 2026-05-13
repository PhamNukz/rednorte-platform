require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connect: connectRabbitMQ, subscribe, EVENTS } = require('../../../shared/events/rabbitmq');
const repository = require('./repositories/listaEsperaRepository');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rutas
app.use('/auth', require('./routes/authRoutes'));
app.use('/solicitudes', require('./routes/listaEsperaRoutes'));

app.get('/health', (_, res) => res.json({ service: 'ms-lista-espera', status: 'ok', port: PORT }));

// Consume evento de reasignación exitosa para actualizar estado
async function setupConsumers() {
  await subscribe(
    'lista-espera.cita-reasignada',
    EVENTS.CITA_REASIGNADA,
    async (payload) => {
      const { solicitud_id, hora_id } = payload;
      await repository.assignHora(solicitud_id, hora_id, 'sistema');
      console.log(`[ms-lista-espera] Hora asignada a solicitud ${solicitud_id}`);
    }
  );
}

async function start() {
  try {
    await connectRabbitMQ(process.env.RABBITMQ_URL);
    await setupConsumers();
    app.listen(PORT, () => console.log(`[ms-lista-espera] Escuchando en puerto ${PORT}`));
  } catch (err) {
    console.error('[ms-lista-espera] Error al iniciar:', err.message);
    process.exit(1);
  }
}

start();
