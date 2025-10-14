package com.internews.gestao_clientes.controllers;

import com.internews.gestao_clientes.dtos.ChatConversationResponseDto;
import com.internews.gestao_clientes.dtos.ChatMessageRequestDto;
import com.internews.gestao_clientes.dtos.ChatMessageResponseDto;
import com.internews.gestao_clientes.dtos.ChatSocketEnvelopeDto;
import com.internews.gestao_clientes.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<?> listConversations(@PathVariable UUID userId) {
        return ResponseEntity.ok(chatService.listConversations(userId));
    }

    @PostMapping("/conversations/{requesterId}/direct/{targetId}")
    public ResponseEntity<ChatConversationResponseDto> createDirectConversation(@PathVariable UUID requesterId,
                                                                                @PathVariable UUID targetId) {
        return ResponseEntity.ok(chatService.createDirectConversation(requesterId, targetId));
    }

    @PostMapping("/messages/{senderId}")
    public ResponseEntity<ChatMessageResponseDto> sendMessage(@PathVariable UUID senderId,
                                                              @RequestBody @Valid ChatMessageRequestDto payload) {
        return ResponseEntity.ok(chatService.sendMessage(senderId, payload));
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<Page<ChatMessageResponseDto>> listMessages(@PathVariable UUID conversationId,
                                                                     @RequestParam(defaultValue = "0") int page,
                                                                     @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(chatService.listMessages(conversationId, pageable));
    }

    @DeleteMapping("/messages/{requesterId}/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable UUID requesterId,
                                              @PathVariable UUID messageId) {
        ChatMessageResponseDto deleted = chatService.deleteMessage(requesterId, messageId);

        ChatSocketEnvelopeDto envelope = new ChatSocketEnvelopeDto(
                deleted.id(),
                deleted.conversationId(),
                deleted.senderId(),
                deleted.senderName(),
                null,
                null,
                deleted.type().name(),
                LocalDateTime.now(),
                "MESSAGE_DELETED"
        );

        messagingTemplate.convertAndSend("/topic/chat." + deleted.conversationId(), envelope);
        chatService.listParticipantIds(deleted.conversationId()).forEach(participantId ->
                messagingTemplate.convertAndSend("/queue/users." + participantId, envelope)
        );

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/conversations/{requesterId}/{conversationId}")
    public ResponseEntity<Void> deleteConversation(@PathVariable UUID requesterId,
                                                   @PathVariable UUID conversationId) {
        List<UUID> participantIds = chatService.deleteConversation(requesterId, conversationId);

        ChatSocketEnvelopeDto envelope = new ChatSocketEnvelopeDto(
                null,
                conversationId,
                requesterId,
                null,
                null,
                null,
                null,
                LocalDateTime.now(),
                "CONVERSATION_DELETED"
        );

        messagingTemplate.convertAndSend("/topic/chat." + conversationId, envelope);
        participantIds.forEach(participantId ->
                messagingTemplate.convertAndSend("/queue/users." + participantId, envelope)
        );

        return ResponseEntity.noContent().build();
    }
}
