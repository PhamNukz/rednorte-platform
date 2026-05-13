package com.rednorte.listaespera.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Entidad JPA — Solicitud de Lista de Espera.
 *
 * <p>Representa una solicitud de atención médica especializada realizada
 * por o para un paciente en la red RedNorte.
 */
@Entity
@Table(name = "solicitudes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "paciente_id", length = 50)
    private String pacienteId;

    @Column(name = "rut_paciente", nullable = false, length = 12)
    private String rutPaciente;

    @Column(name = "nombre_paciente", nullable = false, length = 150)
    private String nombrePaciente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "tipo_solicitud")
    private TipoSolicitud tipo;

    @Column(nullable = false, length = 100)
    private String especialidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "prioridad_enum")
    @Builder.Default
    private Prioridad prioridad = Prioridad.MEDIA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "estado_solicitud")
    @Builder.Default
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "hospital_origen", length = 150)
    private String hospitalOrigen;

    @Column(name = "fecha_ingreso", nullable = false)
    @CreationTimestamp
    private Instant fechaIngreso;

    @Column(name = "fecha_asignacion")
    private Instant fechaAsignacion;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
