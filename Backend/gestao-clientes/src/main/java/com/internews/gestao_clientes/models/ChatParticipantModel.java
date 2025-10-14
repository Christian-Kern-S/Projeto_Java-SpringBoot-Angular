package com.internews.gestao_clientes.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "CHAT_PARTICIPANT", uniqueConstraints = {
        @UniqueConstraint(name = "UK_CHAT_PARTICIPANT_CONV_USER", columnNames = {"conversation_id", "user_id"})
})
public class ChatParticipantModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id")
    @JsonIgnore
    private ChatConversationModel conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UsuarioModel user;

    @Column(nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Column(nullable = false)
    private boolean adminParticipant = false;

    public UUID getId() {
        return id;
    }

    public ChatConversationModel getConversation() {
        return conversation;
    }

    public void setConversation(ChatConversationModel conversation) {
        this.conversation = conversation;
    }

    public UsuarioModel getUser() {
        return user;
    }

    public void setUser(UsuarioModel user) {
        this.user = user;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public boolean isAdminParticipant() {
        return adminParticipant;
    }

    public void setAdminParticipant(boolean adminParticipant) {
        this.adminParticipant = adminParticipant;
    }
}
