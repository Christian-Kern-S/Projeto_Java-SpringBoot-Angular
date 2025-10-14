package com.internews.gestao_clientes.dtos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ChatConversationResponseDto (
    UUID id,
    boolean groupChat,
    String title,
    LocalDateTime updatedAt,
    List<ParticipantDto> participants
) {
    public record ParticipantDto(
        UUID id,
        String username,
        String fullname,
        String avatarUrl,
        boolean admin
    ) {}
}
