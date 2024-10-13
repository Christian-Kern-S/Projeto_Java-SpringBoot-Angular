package com.internews.gestao_clientes.repositories;

import com.internews.gestao_clientes.models.ClienteModel;
import com.internews.gestao_clientes.models.DependenteModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DependenteRepository extends JpaRepository<DependenteModel, UUID> {
    List<DependenteModel> findByNomeContaining(String nome);
    List<DependenteModel> findByIdDependente(UUID idCliente);
}
