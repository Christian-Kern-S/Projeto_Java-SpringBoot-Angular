package com.internews.gestao_clientes.controllers;

import com.internews.gestao_clientes.dtos.ChatConversationResponseDto;
import com.internews.gestao_clientes.dtos.ChatMessageRequestDto;
import com.internews.gestao_clientes.dtos.ChatMessageResponseDto;
import com.internews.gestao_clientes.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
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
}
