require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connect: connectRabbitMQ } = require('../../../shared/events/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/', require('./routes/agendaRoutes'));
app.get('/health', (_, res) => res.json({ service: 'ms-agenda-medica', status: 'ok', port: PORT }));

async function start() {
  try {
    await connectRabbitMQ(process.env.RABBITMQ_URL);
    app.listen(PORT, () => console.log(`[ms-agenda-medica] Escuchando en puerto ${PORT}`));
  } catch (err) {
    console.error('[ms-agenda-medica] Error al iniciar:', err.message);
    process.exit(1);
  }
}

start();
