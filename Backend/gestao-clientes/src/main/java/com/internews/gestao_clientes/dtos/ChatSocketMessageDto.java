package com.internews.gestao_clientes.dtos;

import com.internews.gestao_clientes.models.ChatMessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ChatSocketMessageDto(
        @NotNull UUID conversationId,
        @NotBlank String content,
        @NotNull ChatMessageType type
) {}