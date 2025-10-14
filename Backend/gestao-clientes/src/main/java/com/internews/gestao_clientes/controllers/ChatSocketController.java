package com.internews.gestao_clientes.controllers;

import com.internews.gestao_clientes.dtos.ChatMessageRequestDto;
import com.internews.gestao_clientes.dtos.ChatMessageResponseDto;
import com.internews.gestao_clientes.dtos.ChatSocketEnvelopeDto;
import com.internews.gestao_clientes.dtos.ChatSocketMessageDto;
import com.internews.gestao_clientes.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
public class ChatSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatSocketController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.send.{senderId}")
    @SendTo("/topic/chat")
        public void sendMessage(@Payload @Valid ChatSocketMessageDto payload,
                                                        @DestinationVariable UUID senderId) {

        ChatMessageResponseDto saved = chatService.sendMessage(senderId,
                new ChatMessageRequestDto(
                        payload.conversationId(),
                        payload.content(),
                        payload.type()
                ));

        ChatSocketEnvelopeDto envelope = new ChatSocketEnvelopeDto(
                saved.id(),
                saved.conversationId(),
                saved.senderId(),
                saved.senderName(),
                saved.content(),
                saved.mediaUrl(),
                saved.type().name(),
                saved.createdAt(),
                "MESSAGE_CREATED"
        );

        messagingTemplate.convertAndSend(
                "/topic/chat." + saved.conversationId(),
                envelope
        );

        List<UUID> participantIds = chatService.listParticipantIds(saved.conversationId());
        participantIds.forEach(participantId ->
                messagingTemplate.convertAndSend(
                        "/queue/users." + participantId,
                        envelope
                )
        );
    }
}