package com.internews.gestao_clientes.dtos;

import com.internews.gestao_clientes.models.ChatMessageType;

import java.time.LocalDateTime;
import java.util.UUID;


public record ChatMessageResponseDto (
    UUID id,
    UUID conversationId,
    UUID senderId,
    String senderName,
    ChatMessageType type,
    String content,
    String mediaUrl,
    LocalDateTime createdAt
) {}
