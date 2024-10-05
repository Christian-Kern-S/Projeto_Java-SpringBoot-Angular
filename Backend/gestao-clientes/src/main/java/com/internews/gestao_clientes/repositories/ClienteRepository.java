package com.internews.gestao_clientes.repositories;

import com.internews.gestao_clientes.models.ClienteModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClienteRepository extends JpaRepository<ClienteModel, UUID> {

    Optional<ClienteModel> findByCpf(String cpf);
}
