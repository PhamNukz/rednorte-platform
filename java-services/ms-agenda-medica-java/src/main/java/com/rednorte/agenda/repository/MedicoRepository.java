package com.rednorte.agenda.repository;

import com.rednorte.agenda.domain.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, UUID> {
    List<Medico> findByEspecialidadAndActivoTrue(String especialidad);
    List<Medico> findByActivoTrue();
}
