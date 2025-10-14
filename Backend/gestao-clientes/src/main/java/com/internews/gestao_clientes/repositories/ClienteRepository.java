package com.internews.gestao_clientes.repositories;

import com.internews.gestao_clientes.models.ClienteModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClienteRepository extends JpaRepository<ClienteModel, UUID> {

    List<ClienteModel> findByNomeContaining(String nome);
    List<ClienteModel> findByIdCliente(UUID idCliente);
}
