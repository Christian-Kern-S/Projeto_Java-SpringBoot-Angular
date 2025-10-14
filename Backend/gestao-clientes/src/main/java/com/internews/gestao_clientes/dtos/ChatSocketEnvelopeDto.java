package com.internews.gestao_clientes.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public record ChatSocketEnvelopeDto(
        UUID messageId,
        UUID conversationId,
        UUID senderId,
        String senderName,
        String content,
        String mediaUrl,
        String type,
        LocalDateTime createdAt,
        String eventType
) {}