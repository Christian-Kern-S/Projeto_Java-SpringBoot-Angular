package com.internews.gestao_clientes.repositories;

import com.internews.gestao_clientes.models.ChatParticipantModel;
import com.internews.gestao_clientes.models.ChatConversationModel;
import com.internews.gestao_clientes.models.UsuarioModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChatParticipantRepository extends JpaRepository<ChatParticipantModel, UUID> {

    Optional<ChatParticipantModel> findByConversationAndUser(ChatConversationModel conversation, UsuarioModel user);
}
