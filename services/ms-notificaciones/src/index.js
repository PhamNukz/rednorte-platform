require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const nodemailer = require('nodemailer');
const { connect: connectRabbitMQ, subscribe, EVENTS } = require('../../../shared/events/rabbitmq');
const { verifyToken, requireRole } = require('../../../shared/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function enviarEmail(destinatario, asunto, mensaje) {
  try {
    await transporter.sendMail({
      from: `"RedNorte Salud" <${process.env.SMTP_USER || 'no-reply@rednorte.cl'}>`,
      to: destinatario,
      subject: asunto,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px">
        <h2 style="color:#0073b1">Servicio Público de Salud RedNorte</h2>
        <p>${mensaje}</p>
        <hr><p style="font-size:12px;color:#666">Este es un mensaje automático.</p>
      </div>`,
    });
    console.log(`[ms-notificaciones] Email enviado a ${destinatario}`);
  } catch (err) {
    console.error(`[ms-notificaciones] Error enviando email:`, err.message);
    throw err;
  }
}

async function procesarNotificacion(payload) {
  const { paciente_id, tipo, mensaje, canal, email_destino } = payload;
  const canales = Array.isArray(canal) ? canal : [canal];

  console.log(`[ms-notificaciones] Notificación ${tipo} para paciente ${paciente_id}`);

  for (const c of canales) {
    if (c === 'email' && email_destino) {
      const asunto = tipo === 'reasignacion'
        ? 'Confirmación de nueva cita médica — RedNorte'
        : tipo === 'cancelacion'
        ? 'Tu cita fue cancelada — RedNorte'
        : 'Notificación RedNorte';
      await enviarEmail(email_destino, asunto, mensaje);
    } else if (c === 'push') {
      // Placeholder para integración con FCM/APNs
      console.log(`[ms-notificaciones] Push enviado a paciente ${paciente_id}: ${mensaje}`);
    } else if (c === 'sms') {
      // Placeholder para integración con Twilio / SMS
      console.log(`[ms-notificaciones] SMS para paciente ${paciente_id}: ${mensaje}`);
    }
  }
}

// API para consultar estado del servicio
app.get('/health', (_, res) => res.json({ service: 'ms-notificaciones', status: 'ok', port: PORT }));

// Endpoint para forzar notificación manual (admin)
app.post('/notificaciones/manual', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await procesarNotificacion(req.body);
    res.json({ ok: true, message: 'Notificación procesada' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

async function start() {
  try {
    await connectRabbitMQ(process.env.RABBITMQ_URL);
    // Suscribirse a todos los eventos que requieren notificación
    await subscribe(
      'notificaciones.requerida',
      EVENTS.NOTIFICACION_REQUERIDA,
      procesarNotificacion
    );
    await subscribe(
      'notificaciones.cita-confirmada',
      EVENTS.CITA_CONFIRMADA,
      async (payload) => procesarNotificacion({ ...payload, tipo: 'confirmacion', canal: ['email', 'push'] })
    );
    await subscribe(
      'notificaciones.cita-cancelada',
      EVENTS.CITA_CANCELADA,
      async (payload) => procesarNotificacion({ ...payload, tipo: 'cancelacion', canal: ['email'] })
    );
    app.listen(PORT, () => console.log(`[ms-notificaciones] Escuchando en puerto ${PORT}`));
  } catch (err) {
    console.error('[ms-notificaciones] Error al iniciar:', err.message);
    process.exit(1);
  }
}

start();
