package com.internews.gestao_clientes.repositories;

import com.internews.gestao_clientes.models.ChatMessageModel;
import com.internews.gestao_clientes.models.ChatConversationModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessageModel, UUID> {
    Page<ChatMessageModel> findByConversationOrderByCreatedAtDesc(ChatConversationModel conversation, Pageable pageable);
}
