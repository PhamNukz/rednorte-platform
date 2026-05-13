require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/reportes', require('./routes/reportesRoutes'));
app.get('/health', (_, res) => res.json({ service: 'ms-reportes', status: 'ok', port: PORT }));

app.listen(PORT, () => console.log(`[ms-reportes] Escuchando en puerto ${PORT}`));
