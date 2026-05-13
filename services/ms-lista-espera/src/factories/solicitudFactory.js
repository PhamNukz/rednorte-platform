/**
 * Factory Method — centraliza la creación de distintos tipos de solicitudes médicas.
 * Tipos: urgencia | programada | procedimiento | quirurgica
 */

class SolicitudBase {
  constructor(data) {
    this.paciente_id = data.paciente_id;
    this.rut_paciente = data.rut_paciente;
    this.nombre_paciente = data.nombre_paciente;
    this.especialidad = data.especialidad;
    this.descripcion = data.descripcion;
    this.hospital_origen = data.hospital_origen;
    this.creado_por = data.creado_por;
  }
  validate() {
    const required = ['paciente_id', 'rut_paciente', 'nombre_paciente', 'especialidad', 'creado_por'];
    for (const field of required) {
      if (!this[field]) throw new Error(`Campo requerido faltante: ${field}`);
    }
  }
  toObject() {
    return { ...this };
  }
}

class SolicitudUrgencia extends SolicitudBase {
  constructor(data) {
    super(data);
    this.tipo = 'urgencia';
    this.prioridad = 'critica';
  }
}

class SolicitudProgramada extends SolicitudBase {
  constructor(data) {
    super(data);
    this.tipo = 'programada';
    this.prioridad = data.prioridad || 'media';
  }
}

class SolicitudProcedimiento extends SolicitudBase {
  constructor(data) {
    super(data);
    this.tipo = 'procedimiento';
    this.prioridad = data.prioridad || 'alta';
    this.procedimiento = data.procedimiento;
  }
}

class SolicitudQuirurgica extends SolicitudBase {
  constructor(data) {
    super(data);
    this.tipo = 'quirurgica';
    this.prioridad = 'alta';
    this.intervencion = data.intervencion;
  }
}

class SolicitudFactory {
  static create(tipo, data) {
    const creators = {
      urgencia:     () => new SolicitudUrgencia(data),
      programada:   () => new SolicitudProgramada(data),
      procedimiento:() => new SolicitudProcedimiento(data),
      quirurgica:   () => new SolicitudQuirurgica(data),
    };

    const creator = creators[tipo];
    if (!creator) {
      throw new Error(`Tipo de solicitud desconocido: ${tipo}. Válidos: ${Object.keys(creators).join(', ')}`);
    }

    const solicitud = creator();
    solicitud.validate();
    return solicitud.toObject();
  }
}

module.exports = SolicitudFactory;
