const amqp = require('amqplib');

let connection = null;
let channel = null;

const EXCHANGE = 'rednorte.events';

// Eventos del sistema
const EVENTS = {
  CITA_CANCELADA: 'cita.cancelada',
  CITA_CONFIRMADA: 'cita.confirmada',
  CITA_REASIGNADA: 'cita.reasignada',
  PACIENTE_REGISTRADO: 'paciente.registrado',
  HORA_DISPONIBLE: 'hora.disponible',
  NOTIFICACION_REQUERIDA: 'notificacion.requerida',
};

async function connect(url, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      connection = await amqp.connect(url);
      channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
      console.log('[RabbitMQ] Conexión establecida');
      connection.on('error', (err) => console.error('[RabbitMQ] Error de conexión:', err.message));
      connection.on('close', () => console.warn('[RabbitMQ] Conexión cerrada'));
      return;
    } catch (err) {
      console.warn(`[RabbitMQ] Reintento ${i + 1}/${retries}:`, err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error('[RabbitMQ] No se pudo conectar');
}

/**
 * Publica un evento en el exchange.
 * @param {string} routingKey - Clave de enrutamiento (ej: 'cita.cancelada')
 * @param {object} payload - Datos del evento
 */
function publish(routingKey, payload) {
  if (!channel) throw new Error('[RabbitMQ] Canal no inicializado');
  const message = JSON.stringify({ ...payload, timestamp: new Date().toISOString() });
  channel.publish(EXCHANGE, routingKey, Buffer.from(message), { persistent: true });
  console.log(`[RabbitMQ] Evento publicado: ${routingKey}`);
}

/**
 * Suscribe a eventos por routing key pattern.
 * @param {string} queue - Nombre de la cola
 * @param {string} bindingKey - Patrón de enrutamiento (ej: 'cita.*')
 * @param {function} handler - Función que procesa el mensaje
 */
async function subscribe(queue, bindingKey, handler) {
  if (!channel) throw new Error('[RabbitMQ] Canal no inicializado');
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, EXCHANGE, bindingKey);
  channel.prefetch(1);
  channel.consume(queue, async (msg) => {
    if (!msg) return;
    try {
      const payload = JSON.parse(msg.content.toString());
      await handler(payload);
      channel.ack(msg);
    } catch (err) {
      console.error(`[RabbitMQ] Error procesando ${bindingKey}:`, err.message);
      channel.nack(msg, false, false);
    }
  });
  console.log(`[RabbitMQ] Suscrito a: ${bindingKey} → cola: ${queue}`);
}

function getChannel() {
  return channel;
}

module.exports = { connect, publish, subscribe, getChannel, EVENTS };
