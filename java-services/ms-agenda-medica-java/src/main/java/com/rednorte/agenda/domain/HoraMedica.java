package com.rednorte.agenda.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

/** Entidad JPA — Hora médica disponible/reservada en la agenda. */
@Entity
@Table(name = "horas_medicas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoraMedica {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @Column(name = "fecha_hora", nullable = false)
    private Instant fechaHora;

    @Column(name = "duracion_min", nullable = false)
    @Builder.Default
    private int duracionMin = 30;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "estado_hora")
    @Builder.Default
    private EstadoHora estado = EstadoHora.DISPONIBLE;

    /** Referencia a la solicitud del ms-lista-espera (cross-service ID). */
    @Column(name = "solicitud_id")
    private UUID solicitudId;

    @Column(name = "paciente_rut", length = 12)
    private String pacienteRut;

    @Column(name = "paciente_nombre", length = 150)
    private String pacienteNombre;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
