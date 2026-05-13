/**
 * Circuit Breaker — protege llamadas HTTP entre microservicios.
 *
 * Estados:
 *   CLOSED   → todo normal, deja pasar peticiones
 *   OPEN     → fallo detectado, rechaza peticiones sin ejecutarlas
 *   HALF_OPEN → prueba si el servicio recuperó
 */

const STATES = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 30000; // ms antes de pasar a HALF_OPEN

    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }

  async call(fn) {
    if (this.state === STATES.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`[CircuitBreaker:${this.name}] Circuito ABIERTO — servicio no disponible`);
      }
      this.state = STATES.HALF_OPEN;
    }

    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure();
      throw err;
    }
  }

  _onSuccess() {
    this.failureCount = 0;
    if (this.state === STATES.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = STATES.CLOSED;
        this.successCount = 0;
        console.log(`[CircuitBreaker:${this.name}] Circuito CERRADO — servicio recuperado`);
      }
    }
  }

  _onFailure() {
    this.failureCount++;
    if (this.state === STATES.HALF_OPEN) {
      this.state = STATES.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
      console.warn(`[CircuitBreaker:${this.name}] Circuito ABIERTO de nuevo`);
      return;
    }
    if (this.failureCount >= this.failureThreshold) {
      this.state = STATES.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
      console.warn(`[CircuitBreaker:${this.name}] Circuito ABIERTO tras ${this.failureCount} fallos`);
    }
  }

  getStatus() {
    return { name: this.name, state: this.state, failureCount: this.failureCount };
  }
}

module.exports = CircuitBreaker;
