package com.internews.gestao_clientes.repositories;

import com.internews.gestao_clientes.models.UsuarioModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<UsuarioModel, UUID> {
    Optional<UsuarioModel> findByUsername(String username);
    Optional<UsuarioModel> findById(UUID id_user);
}
