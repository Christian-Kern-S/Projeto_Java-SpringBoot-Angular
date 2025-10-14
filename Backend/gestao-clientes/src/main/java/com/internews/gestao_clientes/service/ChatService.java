package com.internews.gestao_clientes.service;

import com.internews.gestao_clientes.dtos.ChatConversationResponseDto;
import com.internews.gestao_clientes.dtos.ChatMessageRequestDto;
import com.internews.gestao_clientes.dtos.ChatMessageResponseDto;
import com.internews.gestao_clientes.models.ChatConversationModel;
import com.internews.gestao_clientes.models.ChatMessageModel;
import com.internews.gestao_clientes.models.ChatParticipantModel;
import com.internews.gestao_clientes.models.UsuarioModel;
import com.internews.gestao_clientes.repositories.ChatConversationRepository;
import com.internews.gestao_clientes.repositories.ChatMessageRepository;
import com.internews.gestao_clientes.repositories.ChatParticipantRepository;
import com.internews.gestao_clientes.repositories.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ChatService {

    private final ChatConversationRepository conversationRepository;
    private final ChatParticipantRepository participantRepository;
    private final ChatMessageRepository messageRepository;
    private final UsuarioRepository usuarioRepository;

    public ChatService(ChatConversationRepository conversationRepository,
                       ChatParticipantRepository participantRepository,
                       ChatMessageRepository messageRepository,
                       UsuarioRepository usuarioRepository) {
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.messageRepository = messageRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<ChatConversationResponseDto> listConversations(UUID userId) {
        UsuarioModel user = getUserOrThrow(userId);
        return conversationRepository.findAllByParticipant(user)
                .stream()
                .map(conversation -> mapConversation(conversation, userId))
                .toList();
    }

    public ChatConversationResponseDto createDirectConversation(UUID requesterId, UUID targetId) {
        if (requesterId.equals(targetId)) {
            throw new IllegalArgumentException("Não é possível iniciar conversa com você mesmo.");
        }

        UsuarioModel requester = getUserOrThrow(requesterId);
        UsuarioModel target = getUserOrThrow(targetId);

        ChatConversationModel existing = conversationRepository.findDirectConversation(requester, target);
        if (existing != null) {
            return mapConversation(existing, requesterId);
        }

        ChatConversationModel conversation = new ChatConversationModel();
        conversation.setGroupChat(false);
        conversation.setTitle(null);

        ChatParticipantModel requesterParticipant = new ChatParticipantModel();
        requesterParticipant.setConversation(conversation);
        requesterParticipant.setUser(requester);

        ChatParticipantModel targetParticipant = new ChatParticipantModel();
        targetParticipant.setConversation(conversation);
        targetParticipant.setUser(target);

        conversation.getParticipants().add(requesterParticipant);
        conversation.getParticipants().add(targetParticipant);

        ChatConversationModel saved = conversationRepository.save(conversation);
        return mapConversation(saved, requesterId);
    }

    public ChatMessageResponseDto sendMessage(UUID senderId, ChatMessageRequestDto dto) {
        UsuarioModel sender = getUserOrThrow(senderId);
        ChatConversationModel conversation = conversationRepository.findById(dto.conversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversa não encontrada"));

        participantRepository.findByConversationAndUser(conversation, sender)
                .orElseThrow(() -> new IllegalStateException("Usuário não participa desta conversa"));

        ChatMessageModel message = new ChatMessageModel();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setType(dto.type());
        message.setContent(dto.content());
        message.setCreatedAt(LocalDateTime.now());

        ChatMessageModel saved = messageRepository.save(message);

        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return mapMessage(saved);
    }

    public Page<ChatMessageResponseDto> listMessages(UUID conversationId, Pageable pageable) {
        ChatConversationModel conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversa não encontrada"));

        return messageRepository.findByConversationOrderByCreatedAtDesc(conversation, pageable)
                .map(this::mapMessage);
    }

    public List<UUID> listParticipantIds(UUID conversationId) {
    ChatConversationModel conversation = conversationRepository.findById(conversationId)
        .orElseThrow(() -> new IllegalArgumentException("Conversa não encontrada"));

    return conversation.getParticipants()
        .stream()
        .map(participant -> participant.getUser().getId())
        .toList();
    }

    public ChatMessageResponseDto deleteMessage(UUID requesterId, UUID messageId) {
    UsuarioModel requester = getUserOrThrow(requesterId);
    ChatMessageModel message = messageRepository.findById(messageId)
        .orElseThrow(() -> new IllegalArgumentException("Mensagem não encontrada"));

    if (!message.getSender().getId().equals(requesterId)) {
        throw new IllegalStateException("Apenas o remetente pode excluir esta mensagem");
    }

    ChatConversationModel conversation = message.getConversation();
    participantRepository.findByConversationAndUser(conversation, requester)
        .orElseThrow(() -> new IllegalStateException("Usuário não participa desta conversa"));

    ChatMessageResponseDto dto = mapMessage(message);

    messageRepository.delete(message);

    conversation.setUpdatedAt(LocalDateTime.now());
    conversationRepository.save(conversation);

    return dto;
    }

    public List<UUID> deleteConversation(UUID requesterId, UUID conversationId) {
    UsuarioModel requester = getUserOrThrow(requesterId);
    ChatConversationModel conversation = conversationRepository.findById(conversationId)
        .orElseThrow(() -> new IllegalArgumentException("Conversa não encontrada"));

    participantRepository.findByConversationAndUser(conversation, requester)
        .orElseThrow(() -> new IllegalStateException("Usuário não participa desta conversa"));

    List<UUID> participantIds = conversation.getParticipants()
        .stream()
        .map(participant -> participant.getUser().getId())
        .toList();

    conversationRepository.delete(conversation);

    return participantIds;
    }

    private UsuarioModel getUserOrThrow(UUID userId) {
        return usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
    }

    private ChatConversationResponseDto mapConversation(ChatConversationModel conversation, UUID currentUserId) {
        return new ChatConversationResponseDto(
                conversation.getId(),
                conversation.isGroupChat(),
                resolveTitle(conversation, currentUserId),
                conversation.getUpdatedAt(),
                conversation.getParticipants()
                        .stream()
                        .map(participant -> new ChatConversationResponseDto.ParticipantDto(
                                participant.getUser().getId(),
                                participant.getUser().getUsername(),
                                participant.getUser().getFullname(),
                                participant.getUser().getAvatarUrl(),
                                participant.isAdminParticipant()
                        ))
                        .toList()
        );
    }

    private String resolveTitle(ChatConversationModel conversation, UUID currentUserId) {
        if (conversation.isGroupChat()) {
            return conversation.getTitle();
        }
        return conversation.getParticipants()
                .stream()
                .map(ChatParticipantModel::getUser)
                .filter(user -> !user.getId().equals(currentUserId))
                .findFirst()
                .map(user -> user.getFullname() != null ? user.getFullname() : user.getUsername())
                .orElse("Conversa");
    }

    private ChatMessageResponseDto mapMessage(ChatMessageModel message) {
        UsuarioModel sender = message.getSender();
        String senderName = sender.getFullname() != null && !sender.getFullname().isBlank()
                ? sender.getFullname()
                : sender.getUsername();

        return new ChatMessageResponseDto(
                message.getId(),
                message.getConversation().getId(),
                sender.getId(),
                senderName,
                message.getType(),
                message.getContent(),
                message.getMediaUrl(),
                message.getCreatedAt()
        );
    }
}